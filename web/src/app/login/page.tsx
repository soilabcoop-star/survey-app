"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function login() {
    setErr(null);
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      router.push("/admin/projects");
    } catch (e: any) {
      setErr(e?.message ?? "로그인 실패");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h1>관리자 로그인</h1>
      <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
      <button onClick={login} style={{ marginTop: 8 }}>로그인</button>
      {err && <p style={{ marginTop: 8 }}>{err}</p>}
    </div>
  );
}
