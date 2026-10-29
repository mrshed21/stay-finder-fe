export async function login(email: string, password: string) {
  const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login/`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (response.ok) {
    return true;
  }
  return false;
}

export async function register(email: string, password: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return response.ok;
}

export async function logout() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout/`, {
    method: "POST",
    credentials: "include",
  });
  return response.ok;
}


export async function getMe(): Promise<AuthUser | null> {
  const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me/`);

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data?.user as AuthUser | null;
  }
  return null;
}
