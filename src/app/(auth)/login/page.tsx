"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// i18n strings — login page is a client component, so we inline the en keys
// rather than getDictionary (server-only). Values match en.json exactly.
const t = {
  signIn: "Sign In",
  email: "Email address",
  password: "Password",
  invalidCredentials: "Invalid email or password.",
  emailRequired: "Email is required.",
  passwordRequired: "Password is required.",
  noAccount: "Don't have an account?",
  signUp: "Create Account",
  appFullName: "Australian Kachin Christian Church",
  loading: "Loading…",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = t.emailRequired;
    if (!password) next.password = t.passwordRequired;
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrors({ form: t.invalidCredentials });
        return;
      }
      router.push("/profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardBody className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">{t.signIn}</h1>
            <p className="text-sm text-[var(--muted)] mt-1">{t.appFullName}</p>
          </div>

          {errors.form && (
            <div
              role="alert"
              className="rounded-[var(--r-md)] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
            >
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label={t.email}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              disabled={loading}
            />
            <Input
              label={t.password}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.loading : t.signIn}
            </Button>
          </form>

          <p className="text-sm text-center text-[var(--body)]">
            {t.noAccount}{" "}
            <Link
              href="/signup"
              className="font-medium text-[var(--primary)] hover:text-[var(--primary-deep)] underline-offset-2 hover:underline"
            >
              {t.signUp}
            </Link>
          </p>
        </CardBody>
      </Card>
    </main>
  );
}
