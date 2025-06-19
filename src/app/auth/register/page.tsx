
import AuthLayout from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create an Account"
      description="Join FurnTrack to manage your furniture business efficiently."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
