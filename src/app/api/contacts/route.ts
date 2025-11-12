import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Contact } from "@/types/whatsapp";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json");

// Asegurar que el directorio y archivo existan
async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(CONTACTS_FILE);
    } catch {
      await fs.writeFile(CONTACTS_FILE, JSON.stringify({}));
    }
  } catch (error) {
    console.error("Error creando archivo de datos:", error);
  }
}

async function readContacts(): Promise<Record<string, Contact>> {
  await ensureDataFile();
  try {
    const data = await fs.readFile(CONTACTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeContacts(contacts: Record<string, Contact>) {
  await ensureDataFile();
  await fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumberId = searchParams.get("phoneNumberId");

    if (!phoneNumberId) {
      return NextResponse.json(
        { error: "phoneNumberId es requerido" },
        { status: 400 }
      );
    }

    const contacts = await readContacts();
    const contactsList = Object.values(contacts);

    return NextResponse.json(contactsList);
  } catch (error) {
    console.error("Error obteniendo contactos:", error);
    return NextResponse.json(
      { error: "Error obteniendo contactos" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, status, contactName } = body;

    if (!phoneNumber || !status) {
      return NextResponse.json(
        { error: "phoneNumber y status son requeridos" },
        { status: 400 }
      );
    }

    const contacts = await readContacts();

    contacts[phoneNumber] = {
      phoneNumber,
      contactName: contactName || contacts[phoneNumber]?.contactName,
      status,
      updatedAt: new Date().toISOString(),
    };

    await writeContacts(contacts);

    return NextResponse.json(contacts[phoneNumber]);
  } catch (error) {
    console.error("Error actualizando contacto:", error);
    return NextResponse.json(
      { error: "Error actualizando contacto" },
      { status: 500 }
    );
  }
}
