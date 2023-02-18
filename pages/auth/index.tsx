import Router from "next/router";
import { useContext, useState, FormEvent, useEffect } from "react";
import { UserContext } from "../../provider/UserProvider";
import { ImGoogle, ImFacebook } from "react-icons/im";
import { ThemeContext } from "../../provider/ThemeProvider";
import { useRouter } from "next/router";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

const Auth = () => {
  const { theme } = useContext(ThemeContext);
  const router = useRouter();
  const supabase = useSupabaseClient();

  useEffect(() => {
    document.body.classList.value = "";
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  // useState
  const [signUp, setSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // useContext
  const user = useUser();

  console.log(user);

  useEffect(() => {
    if (!signUp) setError("");
  }, [router, signUp]);

  // functions
  const handleSignUpWithPassword = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    Router.push("/");
  };

  const handleSignInWithPassword = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    Router.push("/");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!signUp) {
      handleSignInWithPassword();
    } else {
      handleSignUpWithPassword();
    }
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000",
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    Router.push("/");
  };

  const signInWithFacebook = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: "http://localhost:3000",
      },
    });

    if (error) {
      setError(error.message);
      return;
    }
    Router.push("/");
  };

  // const signInWithTwitter = async () => {
  //   const { user } = await signInWithPopup(auth, twitterAuthProvider);

  //   setUser(user);
  //   Router.push("/");
  // };

  return (
    <div className={`theme-${theme}`}>
      <div className="grid h-screen place-items-center">
        <div className="flex flex-col gap-4 items-start">
          {!signUp ? (
            <h1 className="text-3xl font-bold">Dezktop</h1>
          ) : (
            <h1 className="text-3xl font-bold">Dezktop</h1>
          )}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background2 focus:outline-none  p-2 rounded w-72 text-content"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  if (e.target.value !== confirmPassword && signUp) {
                    setError("Password Not Matched.");
                  } else {
                    setError("");
                  }
                  setPassword(e.target.value);
                }}
                className="bg-background2 focus:outline-none  p-2 rounded w-72 text-content"
              />
            </div>
            {signUp && (
              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    if (e.target.value !== password) {
                      setError("Password Not Matched.");
                    } else {
                      setError("");
                    }
                    setConfirmPassword(e.target.value);
                  }}
                  className="bg-background2  focus:outline-none p-2 rounded w-72 text-content"
                />
              </div>
            )}
            {error.length > 0 && <p className="text-red-500">{error}</p>}
            {!signUp ? (
              <button
                type="submit"
                onClick={handleSignInWithPassword}
                className="bg-background2 hover:bg-buttonHover  p-2 w-72 rounded text-content"
              >
                Sign in
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSignUpWithPassword}
                className="bg-background2 hover:bg-buttonHover  p-2 w-72 rounded text-content"
              >
                Sign up
              </button>
            )}
          </form>
          {!signUp && (
            <div className="flex flex-col gap-4">
              <button
                onClick={signInWithGoogle}
                className="flex gap-2 items-center bg-background2 hover:bg-buttonHover  p-2 w-72 rounded text-content"
              >
                <ImGoogle size={20} />
                <span className="flex justify-center w-full">
                  Sign in with Google
                </span>
              </button>
              <button
                onClick={signInWithFacebook}
                className="flex gap-2 items-center bg-background2 hover:bg-buttonHover  p-2 w-72 rounded text-content"
              >
                <ImFacebook size={20} />
                <span className="flex justify-center w-full">
                  Sign in with Facebook
                </span>
              </button>
              {/* <button
          onClick={signInWithTwitter}
          className="flex gap-2 items-center bg-background2   p-2 w-72 rounded text-content"
        >
          <ImTwitter size={20} />
          Sign in with Twitter
        </button> */}
            </div>
          )}

          {!signUp ? (
            <div>
              {"Don't have an account? "}
              <button onClick={() => setSignUp(true)}>Sign Up</button>
            </div>
          ) : (
            <div>
              {"Already have an account? "}
              <button onClick={() => setSignUp(false)}>Sign In</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
