
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, Mail, User, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Schema for Login
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

// Schema for Registration with password strength
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const registerSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Schema for Forgot Password
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false as unknown as true, // This is where the error is happening, let's fix it
    },
  });

  // Forgot password form
  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle login
  const onLogin = async (data: LoginFormValues) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      toast.success("Logged in successfully", {
        description: "Welcome back to SpendWise!",
      });

      // Redirect to dashboard
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      setAuthError(error.message || "Failed to log in. Please check your credentials.");
      toast.error("Login failed", {
        description: error.message || "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration
  const onRegister = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Registration successful", {
        description: "Please check your email to verify your account.",
      });

      // Switch to login tab after successful registration
      setActiveTab("login");
    } catch (error: any) {
      console.error("Registration error:", error);
      setAuthError(error.message || "Failed to create account. Please try again.");
      toast.error("Registration failed", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password
  const onForgotPassword = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast.success("Password reset email sent", {
        description: "Please check your email for instructions to reset your password.",
      });
      
      // Switch back to login tab
      setActiveTab("login");
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setAuthError(error.message || "Failed to send reset email. Please try again.");
      toast.error("Reset request failed", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate password strength
  const getPasswordStrength = (password: string): [string, string] => {
    if (!password) return ["", ""];
    if (password.length < 8) return ["bg-red-500", "Weak"];
    
    let score = 0;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[a-z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^A-Za-z0-9]/)) score++;
    if (password.length >= 12) score++;
    
    if (score <= 2) return ["bg-red-500", "Weak"];
    if (score <= 3) return ["bg-yellow-500", "Medium"];
    return ["bg-green-500", "Strong"];
  };
  
  const passwordValue = registerForm.watch("password");
  const [strengthColor, strengthText] = getPasswordStrength(passwordValue);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-spendwise-oxford flex items-center justify-center gap-2">
            <span className="text-spendwise-orange">
              <span className="sr-only">SpendWise</span>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 15v3H6v-3H4v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3h-2Z" fill="currentColor" />
                <path d="M10 8.5 8.5 7l-4.5 4.5L8.5 16l1.5-1.5-2-2h7v-2h-7l2-2Z" fill="currentColor" />
                <path d="M19.5 12 15 7.5 13.5 9l2 2h-3v2h3l-2 2 1.5 1.5L19.5 12Z" fill="currentColor" />
              </svg>
            </span>
            SpendWise
          </h1>
          <p className="text-gray-600">Take control of your finances</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="pb-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex gap-2 items-center text-red-700">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{authError}</p>
              </div>
            )}

            <TabsContent value="login" className="mt-0">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              placeholder="you@example.com"
                              className="pl-10" 
                              autoComplete="email" 
                              disabled={isLoading}
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <FormLabel>Password</FormLabel>
                          <button
                            type="button"
                            className="text-xs text-spendwise-orange hover:underline font-medium"
                            onClick={() => setActiveTab("forgot")}
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              className="pl-10 pr-10"
                              placeholder="••••••••"
                              autoComplete="current-password"
                              disabled={isLoading}
                              {...field} 
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-spendwise-orange hover:bg-spendwise-orange/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register" className="mt-0">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              placeholder="John Smith"
                              className="pl-10" 
                              autoComplete="name" 
                              disabled={isLoading}
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              placeholder="you@example.com"
                              className="pl-10" 
                              autoComplete="email" 
                              disabled={isLoading}
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              className="pl-10 pr-10"
                              placeholder="••••••••"
                              autoComplete="new-password"
                              disabled={isLoading}
                              {...field} 
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        {passwordValue && (
                          <div className="mt-1">
                            <div className="flex items-center space-x-2">
                              <div className={cn("h-2 flex-1 rounded-full", strengthColor)}></div>
                              <span className="text-xs font-medium">{strengthText}</span>
                            </div>
                            <ul className="text-xs text-gray-500 mt-2 space-y-1 list-disc pl-4">
                              <li className={passwordValue.length >= 8 ? "text-green-600" : ""}>
                                At least 8 characters
                              </li>
                              <li className={passwordValue.match(/[A-Z]/) ? "text-green-600" : ""}>
                                One uppercase letter
                              </li>
                              <li className={passwordValue.match(/[a-z]/) ? "text-green-600" : ""}>
                                One lowercase letter
                              </li>
                              <li className={passwordValue.match(/[0-9]/) ? "text-green-600" : ""}>
                                One number
                              </li>
                            </ul>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              type={showConfirmPassword ? "text" : "password"} 
                              className="pl-10 pr-10"
                              placeholder="••••••••"
                              disabled={isLoading}
                              {...field} 
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            I agree to the{" "}
                            <a href="#" className="text-spendwise-orange hover:underline">
                              Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="#" className="text-spendwise-orange hover:underline">
                              Privacy Policy
                            </a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-spendwise-orange hover:bg-spendwise-orange/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="forgot" className="mt-0">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Reset Your Password</h3>
                <p className="text-sm text-gray-600">
                  Enter your email and we'll send you instructions to reset your password.
                </p>
              </div>

              <Form {...forgotPasswordForm}>
                <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPassword)} className="space-y-4">
                  <FormField
                    control={forgotPasswordForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              placeholder="you@example.com"
                              className="pl-10" 
                              disabled={isLoading}
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setActiveTab("login")}
                      disabled={isLoading}
                    >
                      Back to Login
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-spendwise-orange hover:bg-spendwise-orange/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Instructions"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
