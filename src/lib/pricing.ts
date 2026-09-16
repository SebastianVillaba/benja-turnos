export interface ServicePricingData {
  _id?: string;
  name?: string;
  precioCentro: number;
  precioCambyreta: number;
}

export interface BarberPricingData {
  _id?: string;
  name?: string;
  servicePrices?: {
    serviceId: string;
    precioCentro?: number;
    precioCambyreta?: number;
    price?: number;
  }[];
}

export interface PriceResult {
  price: number;
  isCustom: boolean;
}

/**
 * Calcula el precio aplicable para un servicio según la sucursal y el barbero seleccionado.
 * Si el barbero tiene configurada una tarifa para este servicio, se utiliza dicha tarifa.
 * En caso contrario, se utiliza el precio base del servicio para la sucursal correspondiente.
 */
export function getServicePriceForBarber(
  service: ServicePricingData,
  barber?: BarberPricingData | null,
  branchName?: string | null
): PriceResult {
  const isCentro = branchName === 'Centro';
  const defaultPrice = isCentro ? service.precioCentro : service.precioCambyreta;

  if (!barber || !barber.servicePrices || !service._id) {
    return { price: defaultPrice, isCustom: false };
  }

  const custom = barber.servicePrices.find(
    (sp) => sp.serviceId?.toString() === service._id?.toString()
  );

  if (!custom) {
    return { price: defaultPrice, isCustom: false };
  }

  if (isCentro && custom.precioCentro !== undefined && custom.precioCentro !== null && custom.precioCentro > 0) {
    return { price: custom.precioCentro, isCustom: true };
  }

  if (!isCentro && custom.precioCambyreta !== undefined && custom.precioCambyreta !== null && custom.precioCambyreta > 0) {
    return { price: custom.precioCambyreta, isCustom: true };
  }

  if (custom.price !== undefined && custom.price !== null && custom.price > 0) {
    return { price: custom.price, isCustom: true };
  }

  return { price: defaultPrice, isCustom: false };
}

/**
 * Retorna solo el valor numérico del precio para el barbero y sucursal.
 */
export function getServicePriceValue(
  service: ServicePricingData,
  barber?: BarberPricingData | null,
  branchName?: string | null
): number {
  return getServicePriceForBarber(service, barber, branchName).price;
}
