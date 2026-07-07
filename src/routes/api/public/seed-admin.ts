import { createFileRoute } from "@tanstack/react-router";

const ADMIN_EMAIL = "admin@digistreaming.com";
const ADMIN_PASSWORD = "0206White!";

export const Route = createFileRoute("/api/public/seed-admin")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        // Check if the admin already exists by listing users (page 1 is fine for our fixed email)
        const { data: existing } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
        const already = existing?.users?.find((u) => u.email === ADMIN_EMAIL);
        let userId = already?.id;
        if (!already) {
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            email_confirm: true,
            user_metadata: { full_name: "Digistream Admin" },
          });
          if (error) {
            return new Response(JSON.stringify({ ok: false, error: error.message }), {
              status: 500,
              headers: { "content-type": "application/json" },
            });
          }
          userId = data.user?.id;
        }
        // Ensure admin role (trigger sets it based on email, but enforce anyway)
        if (userId) {
          await supabaseAdmin.from("user_roles").upsert(
            { user_id: userId, role: "admin" },
            { onConflict: "user_id,role" },
          );
        }
        return new Response(JSON.stringify({ ok: true, seeded: !already }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
