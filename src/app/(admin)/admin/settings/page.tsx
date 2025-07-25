import { UpdatePasswordForm } from "@/components/admin/UpdatePasswordForm";
import { UpdateProfileForm } from "@/components/admin/UpdateProfileForm"; // <-- Import it

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <div>
        <UpdateProfileForm />

        <UpdatePasswordForm />
      </div>
    </div>
  );
}
