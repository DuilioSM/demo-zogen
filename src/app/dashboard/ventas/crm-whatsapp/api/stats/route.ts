import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Contact, ClientStatus } from "@/types/whatsapp";
import { whatsappClient } from "@/lib/whatsapp-client";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json");

async function readContacts(): Promise<Record<string, Contact>> {
  try {
    const data = await fs.readFile(CONTACTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId");

    if (!channelId) {
      return NextResponse.json(
        { error: "channelId es requerido" },
        { status: 400 }
      );
    }

    // Obtener conversaciones desde la API de WhatsApp
    let totalConversations = 0;
    let activeConversations = 0;

    try {
      const response = await whatsappClient.conversations.list({
        phoneNumberId: channelId,
      });
      totalConversations = response.data?.length || 0;
      activeConversations =
        response.data?.filter((c) => c.status === "active").length || 0;
    } catch (error) {
      console.error("Error obteniendo conversaciones:", error);
    }

    // Obtener estadísticas de estados
    const contacts = await readContacts();
    const contactsList = Object.values(contacts);

    const statusCounts: Record<ClientStatus, number> = {
      "Cotizando": 0,
      "Documentación": 0,
      "Trámite Aprobado": 0,
      "Muestra Tomada": 0,
    };

    contactsList.forEach((contact) => {
      if (contact.status) {
        statusCounts[contact.status]++;
      }
    });

    const stats = {
      totalConversations,
      activeConversations,
      totalContacts: contactsList.length,
      contactsWithStatus: contactsList.filter((c) => c.status).length,
      statusBreakdown: statusCounts,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return NextResponse.json(
      { error: "Error obteniendo estadísticas" },
      { status: 500 }
    );
  }
}
