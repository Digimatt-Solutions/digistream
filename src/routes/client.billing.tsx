import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/client/billing")({
  component: () => (
    <ModulePlaceholder
      title="Billing History"
      description="Downloadable invoices and receipts for your workspace."
      highlights={["PDF invoices","Payment methods","Tax receipts","VAT settings"]}
    />
  ),
});
