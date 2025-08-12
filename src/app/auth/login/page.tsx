
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { Suspense } from 'react';

function LoginPageContent() {
  return (
    <AuthLayout 
      title="Welcome Back!"
      description="Log in to your FurnTrack account to continue."
    >
      <LoginForm />
    </AuthLayout>
  );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPageContent />
        </Suspense>
    )
}
