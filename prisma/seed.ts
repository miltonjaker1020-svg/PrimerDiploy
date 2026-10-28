import { PrismaClient, Role, DonationStatus, RequestStatus } from '@prisma/client';
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.SEED_ALLOW_RESET !== "true") {
    throw new Error("El seed borra datos. Ejecuta con SEED_ALLOW_RESET=true únicamente en una base de pruebas.");
  }
  console.log('🌱 Iniciando seed para FoodShare...');

  await prisma.requestDonation.deleteMany();
  await prisma.request.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.catalog.deleteMany();
  await prisma.user.deleteMany();

  // ---------------------------------------------------------------------------
  // 1. USUARIOS (Regla 1: Roles y Admin creado vía seed)
  // ---------------------------------------------------------------------------
  console.log('👤 Creando usuarios...');

  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const examplePass = await bcrypt.hash("example123!", 10)
  await prisma.user.create({
    data: {
      email: 'admin@foodshare.org',
      password: adminPassword, 
      role: Role.ADMINISTRADOR,
    },
  });

  const donante1 = await prisma.user.create({
    data: {
      email: 'donante1@gmail.com',
      password: examplePass,
      role: Role.DONANTE,
    },
  });

  const donante2 = await prisma.user.create({
    data: {
      email: 'donante2@gmail.com',
      password: examplePass,
      role: Role.DONANTE,
    },
  });

  const beneficiario1 = await prisma.user.create({
    data: {
      email: 'beneficiario1@gmail.com',
      password: examplePass,
      role: Role.BENEFICIARIO,
    },
  });

  const beneficiario2 = await prisma.user.create({
    data: {
      email: 'beneficiario2@gmail.com',
      password: examplePass,
      role: Role.BENEFICIARIO,
    },
  });

  // ---------------------------------------------------------------------------
  // 2. CATÁLOGOS Y PRODUCTOS (Regla 18: Eliminación de productos)
  // ---------------------------------------------------------------------------
  console.log('📦 Creando catálogos y productos...');
  const catalogoGranos = await prisma.catalog.create({
    data: {
      name: 'Granos y Legumbres',
      description: 'Alimentos no perecederos a base de granos secos',
    },
  });

  const catalogoEnlatados = await prisma.catalog.create({
    data: {
      name: 'Enlatados y Conservas',
      description: 'Alimentos procesados en lata con larga vida útil',
    },
  });

  const arroz = await prisma.product.create({
    data: {
      catalogId: catalogoGranos.id,
      name: 'Arroz Blanco 1kg',
      description: 'Bolsa de arroz blanco grano largo de 1kg',
      unit: 'bolsa',
    },
  });

  const frijol = await prisma.product.create({
    data: {
      catalogId: catalogoGranos.id,
      name: 'Frijol Negro 1kg',
      description: 'Bolsa de frijol negro de 1kg',
      unit: 'bolsa',
    },
  });

  const atun = await prisma.product.create({
    data: {
      catalogId: catalogoEnlatados.id,
      name: 'Atún en Agua 170g',
      description: 'Lata de atún en agua lomitos',
      unit: 'lata',
    },
  });

  // Producto SIN donaciones ni solicitudes asociadas
  // (Para probar que este producto SÍ se puede eliminar - Regla 18)
  await prisma.product.create({
    data: {
      catalogId: catalogoEnlatados.id,
      name: 'Sopa de Verduras 400g',
      description: 'Lata de sopa de verduras mixtas (para pruebas de eliminación)',
      unit: 'lata',
    },
  });

  // ---------------------------------------------------------------------------
  // FECHAS DE REFERENCIA PARA CONTROL DE VENCIMIENTO
  // ---------------------------------------------------------------------------
  const now = new Date();
  
  const dateExpired = new Date(now);
  dateExpired.setDate(now.getDate() - 2); // Venció hace 2 días

  const dateExpiresIn4Days = new Date(now);
  dateExpiresIn4Days.setDate(now.getDate() + 4); // Vence en 4 días (Próximos 7 días)

  const dateExpiresIn10Days = new Date(now);
  dateExpiresIn10Days.setDate(now.getDate() + 10); // Vence en 10 días

  const dateExpiresIn25Days = new Date(now);
  dateExpiresIn25Days.setDate(now.getDate() + 25); // Vence en 25 días

  // ---------------------------------------------------------------------------
  // 3. DONACIONES (Escenarios de inventario, vencimiento y estados)
  // ---------------------------------------------------------------------------
  console.log('🌾 Creando donaciones...');

  // Donación 1: PENDIENTE (Donante 1 -> Arroz, 50 unidades, vence en 10 días)
  // Probar: Editable/Cancelable por el donante; NO aporta al stock disponible aún (Regla 3 & 4).
  await prisma.donation.create({
    data: {
      donorId: donante1.id,
      productId: arroz.id,
      quantity: 50,
      expirationDate: dateExpiresIn10Days,
      status: DonationStatus.PENDIENTE,
    },
  });

  // Donación 2: APROBADA con vencimiento CERCANO (4 días) (Donante 1 -> Arroz, 30 unidades)
  // Probar: Vence en los próximos 7 días (Regla 9); FEFO debe tomar de esta primero (Regla 12).
  const donacionAprobadaCercana = await prisma.donation.create({
    data: {
      donorId: donante1.id,
      productId: arroz.id,
      quantity: 30,
      expirationDate: dateExpiresIn4Days,
      status: DonationStatus.APROBADA,
    },
  });

  // Donación 3: APROBADA con vencimiento LEJANO (25 días) (Donante 2 -> Arroz, 40 unidades)
  // Probar: Aporta al stock disponible, pero por FEFO se reserva después de la Donación 2.
  await prisma.donation.create({
    data: {
      donorId: donante2.id,
      productId: arroz.id,
      quantity: 40,
      expirationDate: dateExpiresIn25Days,
      status: DonationStatus.APROBADA,
    },
  });

  // Donación 4: VENCIDA (Donante 1 -> Frijol, 20 unidades, venció hace 2 días)
  // Probar: Regla 7 (Donación aprobada pero vencida NO suma al stock disponible).
  await prisma.donation.create({
    data: {
      donorId: donante1.id,
      productId: frijol.id,
      quantity: 20,
      expirationDate: dateExpired,
      status: DonationStatus.APROBADA,
    },
  });

  // Donación 5: RECHAZADA con motivo (Donante 2 -> Atún, 15 unidades)
  // Probar: Regla 3 (Exige motivo de rechazo) & Regla 5 (No editable ni eliminable).
  await prisma.donation.create({
    data: {
      donorId: donante2.id,
      productId: atun.id,
      quantity: 15,
      expirationDate: dateExpiresIn25Days,
      status: DonationStatus.RECHAZADA,
      rejectionReason: 'Lata abollada / empaque en mal estado',
    },
  });

  // ---------------------------------------------------------------------------
  // 4. SOLICITUDES Y RESERVA DE INVENTARIO (FEFO & Límites de 7 días)
  // ---------------------------------------------------------------------------
  console.log('📋 Creando solicitudes y reservas de inventario...');

  // Solicitud 1: Beneficiario 1 pide 10 unidades de Arroz Blanco (hace 3 días) -> PENDIENTE
  // Reserva automáticamente 10 unidades de Donación 2 (Vencimiento en 4 días).
  const solicitud1 = await prisma.request.create({
    data: {
      beneficiaryId: beneficiario1.id,
      productId: arroz.id,
      quantity: 10,
      status: RequestStatus.PENDIENTE,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // Hace 3 días
    },
  });

  await prisma.requestDonation.create({
    data: {
      requestId: solicitud1.id,
      donationId: donacionAprobadaCercana.id,
      quantity: 10,
    },
  });

  // Solicitud 2: Beneficiario 2 pidió 5 unidades de Arroz Blanco (hace 2 días) -> ENTREGADA
  // Consumió 5 unidades de Donación 2 de forma definitiva (Regla 17).
  const solicitud2 = await prisma.request.create({
    data: {
      beneficiaryId: beneficiario2.id,
      productId: arroz.id,
      quantity: 5,
      status: RequestStatus.ENTREGADA,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
    },
  });

  await prisma.requestDonation.create({
    data: {
      requestId: solicitud2.id,
      donationId: donacionAprobadaCercana.id,
      quantity: 5,
    },
  });

  // Solicitud 3: Beneficiario 1 pide 8 unidades de Arroz Blanco (hace 1 día) -> PENDIENTE
  // Acumulado de Beneficiario 1 en los últimos 7 días: 10 (solicitud 1) + 8 (solicitud 3) = 18 unidades.
  // Probar Regla 13: Beneficiario 1 sólo tiene disponible un margen de 2 unidades adicionales.
  // Reserva de Donación 2 (le quedaban 30 - 10 - 5 = 15 unidades libres; toma 8, le quedan 7 libres).
  const solicitud3 = await prisma.request.create({
    data: {
      beneficiaryId: beneficiario1.id,
      productId: arroz.id,
      quantity: 8,
      status: RequestStatus.PENDIENTE,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Hace 1 día
    },
  });

  await prisma.requestDonation.create({
    data: {
      requestId: solicitud3.id,
      donationId: donacionAprobadaCercana.id,
      quantity: 8,
    },
  });

  // Solicitud 4: Beneficiario 2 solicitó Frijol Negro -> CANCELADA
  // Probar Regla 13 & 16: Las solicitudes canceladas devuelven unidades y NO cuentan para las 20 unidades de 7 días.
  await prisma.request.create({
    data: {
      beneficiaryId: beneficiario2.id,
      productId: frijol.id,
      quantity: 15,
      status: RequestStatus.CANCELADA,
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.request.create({
    data: { beneficiaryId: beneficiario2.id, productId: frijol.id, quantity: 2, status: RequestStatus.RECHAZADA, rejectionReason: "Solicitud de ejemplo rechazada" },
  });

  console.log('✅ Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
