"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const t = {
  signUp: "Create Account",
  email: "Email address",
  password: "Password",
  confirmPassword: "Confirm password",
  fullName: "Full name",
  hasAccount: "Already have an account?",
  signIn: "Sign In",
  signUpSuccess: "Check your email to confirm your account.",
  passwordMismatch: "Passwords do not match.",
  emailRequired: "Email is required.",
  passwordRequired: "Password is required.",
  nameRequired: "Full name is required.",
  appFullName: "Australian Kachin Christian Church",
  loading: "Loading…",
  error: "Something went wrong. Please try again.",
};

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!fullName.trim()) next.fullName = t.nameRequired;
    if (!email.trim()) next.email = t.emailRequired;
    if (!password) next.password = t.passwordRequired;
    if (password && confirmPassword !== password) next.confirmPassword = t.passwordMismatch;
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName.trim() } },
      });
      if (error) {
        // Use a generic message to avoid leaking whether an email is registered
        setErrors({ form: t.error });
        return;
      }
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-sm">
          <CardBody className="space-y-4 text-center">
            <div
              className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-[var(--primary-tint)]"
              aria-hidden="true"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.06 6.06l1.06-1.06a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[var(--ink)]">{t.signUp}</h1>
            <p className="text-[var(--body)]">{t.signUpSuccess}</p>
            <Link
              href="/login"
              className="inline-block text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-deep)] underline-offset-2 hover:underline"
            >
              {t.signIn}
            </Link>
          </CardBody>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardBody className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">{t.signUp}</h1>
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
              label={t.fullName}
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={errors.fullName}
              disabled={loading}
            />
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              disabled={loading}
            />
            <Input
              label={t.confirmPassword}
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.loading : t.signUp}
            </Button>
          </form>

          <p className="text-sm text-center text-[var(--body)]">
            {t.hasAccount}{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--primary)] hover:text-[var(--primary-deep)] underline-offset-2 hover:underline"
            >
              {t.signIn}
            </Link>
          </p>
        </CardBody>
      </Card>
    </main>
  );
}
