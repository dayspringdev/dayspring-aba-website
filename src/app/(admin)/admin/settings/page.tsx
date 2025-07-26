import { UpdatePasswordForm } from "@/components/admin/UpdatePasswordForm";
import { UpdateProfileForm } from "@/components/admin/UpdateProfileForm";
import { UpdateEmailForm } from "@/components/admin/UpdateEmailForm"; // 1. Import the new form

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <div>
        <UpdateProfileForm />
        {/* 2. Add the new form to the page */}
        <UpdateEmailForm />
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
