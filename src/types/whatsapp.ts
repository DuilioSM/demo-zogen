export type TemplateButton = {
  type: string;
  text?: string;
  url?: string;
  phone_number?: string;
  example?: string[];
};

export type TemplateComponentExample = {
  headerText?: string[];
  headerHandle?: string[];
  bodyText?: string[][];
  bodyTextNamedParams?: Array<{
    paramName: string;
    example: string;
  }>;
  headerTextNamedParams?: Array<{
    paramName: string;
    example: string;
  }>;
};

export type TemplateComponent = {
  type: string;
  format?: string;
  text?: string;
  example?: TemplateComponentExample;
  buttons?: TemplateButton[];
};

export type Template = {
  id: string;
  name: string;
  category: string;
  language: string;
  status: string;
  components?: TemplateComponent[];
};

export type ParameterFormat = 'POSITIONAL' | 'NAMED';

export type TemplateParameterInfo = {
  format: ParameterFormat;
  parameters: Array<{
    name: string;
    example?: string;
    component: 'HEADER' | 'BODY' | 'BUTTON';
    buttonIndex?: number; // For button parameters, which button (0-indexed)
  }>;
};

export type TemplateParameters = string[] | Record<string, string>;

export type ClientStatus =
  | "Datos del paciente"
  | "Recolección documentación"
  | "gestión aseguradora"
  | "Solicitud de muestra"
  | "Validación de muestra"
  | "preparacion en laboratorio";

export type Contact = {
  phoneNumber: string;
  contactName?: string;
  status?: ClientStatus;
  updatedAt?: string;
};

export type PhoneNumberInfo = {
  id: string;
  phoneNumber: string;
  displayName?: string;
  isConnected: boolean;
  realPhoneNumberId?: string; // ID real al que redirigir (para vendedores dummy)
};
