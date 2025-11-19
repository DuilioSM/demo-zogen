import { NextResponse } from "next/server";
import type { WhatsappChannelInfo } from "@/types/whatsapp";

export async function GET() {
  try {
    // Por ahora, devolvemos el número configurado en las variables de entorno
    // En el futuro, esto podría conectarse a la API de Meta para obtener todos los números
    const phoneNumberId = process.env.PHONE_NUMBER_ID;

    if (!phoneNumberId) {
      return NextResponse.json(
        { error: "PHONE_NUMBER_ID no configurado" },
        { status: 500 }
      );
    }

    // 5 vendedores dummy con números mexicanos, todos redirigen al mismo phoneNumberId
    const channels: WhatsappChannelInfo[] = [
      {
        id: "vendor-1",
        phoneNumber: "+52 55 1234 5678",
        displayName: "María González",
        isConnected: true,
        realPhoneNumberId: phoneNumberId,
      },
      {
        id: "vendor-2",
        phoneNumber: "+52 33 8765 4321",
        displayName: "Carlos Hernández",
        isConnected: true,
        realPhoneNumberId: phoneNumberId,
      },
      {
        id: "vendor-3",
        phoneNumber: "+52 81 5555 6789",
        displayName: "Ana Martínez",
        isConnected: true,
        realPhoneNumberId: phoneNumberId,
      },
      {
        id: "vendor-4",
        phoneNumber: "+52 55 9876 5432",
        displayName: "Luis Rodríguez",
        isConnected: true,
        realPhoneNumberId: phoneNumberId,
      },
      {
        id: "vendor-5",
        phoneNumber: "+52 33 2468 1357",
        displayName: "Patricia López",
        isConnected: true,
        realPhoneNumberId: phoneNumberId,
      },
    ];

    return NextResponse.json(channels);
  } catch (error) {
    console.error("Error obteniendo canales de WhatsApp:", error);
    return NextResponse.json(
      { error: "Error obteniendo canales de WhatsApp" },
      { status: 500 }
    );
  }
}
