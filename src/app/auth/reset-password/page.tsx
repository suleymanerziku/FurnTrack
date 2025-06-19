
import AuthLayout from '@/components/auth/AuthLayout';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import { Suspense } from 'react';

// Wrapper component to handle suspense for useSearchParams
function ResetPasswordPageContent({ access_token }: { access_token?: string | null }) {
  if (!access_token) {
    // This check might be redundant if the main logic to get user happens in the form
    // based on the session established by the callback.
    // Supabase's modern flow often relies on the /auth/callback to set a temporary session
    // rather than passing long-lived tokens in URL.
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      description="Enter your new password below."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}


export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string; code?: string; access_token?: string };
}) {
  // Supabase uses a 'code' in the URL from the email link, which is exchanged
  // in the /auth/callback route for a session. The user is then redirected here.
  // The actual access_token is usually not directly exposed or used by the client form.
  // The form relies on the active session (established by the callback) to allow password update.

  if (searchParams.error) {
    return (
      <AuthLayout title="Error Resetting Password" description="There was an issue with your password reset link.">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {searchParams.error === "invalid_token" 
              ? "The password reset link is invalid or has expired. Please request a new one."
              : "An unexpected error occurred. Please try again."}
          </AlertDescription>
        </Alert>
      </AuthLayout>
    );
  }
  
  // The presence of a 'code' might mean the callback hasn't run or redirected properly.
  // However, typical flow is email_link -> /auth/callback (exchanges code, sets session) -> /auth/reset-password
  // So, by the time user is on this page, session should allow password update.
  // The `access_token` is not directly used from URL in modern Supabase flows for the form itself.

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageContent access_token={searchParams.access_token} />
    </Suspense>
  );
}
