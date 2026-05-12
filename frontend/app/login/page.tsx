"use client";
import { useState } from "react";
import { authService } from "@/services/authservice";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.login(formData);
      router.push("/"); // Go home on success
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-10 flex flex-col gap-4">
       <input 
         type="email" 
         onChange={(e) => setFormData({...formData, email: e.target.value})} 
         className="border p-2 text-black"
         placeholder="Email" 
       />
       <input 
         type="password" 
         onChange={(e) => setFormData({...formData, password: e.target.value})} 
         className="border p-2 text-black"
         placeholder="Password"
       />
       <button type="submit" className="bg-blue-600 text-white p-2">Login</button>
    </form>
  );
}
