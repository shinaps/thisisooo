'use client'

import {authClient} from "@/lib/auth-client";
import {useState} from "react";
import {useRouter} from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    const {data, error} = await authClient.signUp.email({
      email: email,
      password: password,
      name: ""
    })

    if (!error) {
      router.push('/');
      return
    }

    setError(JSON.stringify(error.message))
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <div>{error}</div>
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">Sign Up</button>
      </form>
    </div>
  );
}
