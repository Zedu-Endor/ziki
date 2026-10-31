"use client";
export async function selectTenantAction(form: FormData): Promise<void> {
  window.dispatchEvent(new CustomEvent("ziki-demo:workspace", { detail: form.get("tenantId") }));
}
