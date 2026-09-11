export type AssistantRole = "user" | "assistant";

export type AssistantActionKey =
  | "estimate"
  | "services"
  | "serviceArea"
  | "contact"
  | "howItWorks"
  | "about"
  | "locations";

export interface AssistantChatMessage {
  role: AssistantRole;
  content: string;
  _actions?: AssistantActionKey[];
}

export interface AssistantAction {
  key: AssistantActionKey;
  label: string;
  href: string;
}

export interface AssistantApiResponse {
  message: string;
  actions: AssistantActionKey[];
}

export interface AssistantApiRequest {
  messages: AssistantChatMessage[];
}

export type AssistantAnalyticsEvent =
  | "assistant_open"
  | "assistant_message_sent"
  | "assistant_quick_action"
  | "assistant_estimate_cta"
  | "assistant_contact_cta";
