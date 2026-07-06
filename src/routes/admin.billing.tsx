import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/admin/billing")({
  component: () => (
    <ModulePlaceholder
      title="Billing"
      description="Invoices, dunning and revenue recognition across tenants."
      highlights={["Stripe-ready invoices","Dunning campaigns","Proration & credits","Revenue exports"]}
    />
  ),
});
