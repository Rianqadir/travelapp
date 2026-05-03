import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Travel<span className="text-accent">Cost</span> PK
          </h1>
          <p className="text-muted-foreground mt-2">Create your free account to get started</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
