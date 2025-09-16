
'use client';

import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { useEffect, useActionState } from 'react';
import { ArrowLeft, Bot, Edit, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signup } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleIcon } from '@/components/icons/google-icon';
import { GitHubIcon } from '@/components/icons/github-icon';

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creating Account...' : 'Create Account'}
    </Button>
  );
};

const AuthFeatures = () => {
  const features = [
    {
      icon: <Edit className="h-6 w-6" />,
      title: 'Intuitive Form Builder',
      description: 'Create beautiful, responsive forms with our easy-to-use builder.',
    },
    {
      icon: <Bot className="h-6 w-6" />,
      title: 'AI-Powered Suggestions',
      description: 'Get smart suggestions for your form fields based on your goals.',
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: 'Easy Sharing & Analytics',
      description: 'Share your forms with a unique link and analyze responses.',
    },
  ];

  return (
    <div className="hidden lg:flex flex-col items-center justify-center space-y-8 bg-primary/5 p-8 rounded-lg border-l">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
        >
          <path
            d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 2V8H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 13H8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 17H8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 9H8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-bold text-2xl text-foreground">FormSet</span>
      </Link>
      <h2 className="text-2xl font-bold text-center">The Easiest Way to Build Forms</h2>
      <p className="text-muted-foreground text-center max-w-sm">
        Create, share, and analyze forms with powerful features designed for everyone.
      </p>
      <div className="space-y-6 self-start">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="bg-primary/10 text-primary p-2 rounded-full">{feature.icon}</div>
            <div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SignupPage() {
  const [state, formAction] = useActionState(signup, { error: "" });
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
      return;
    }
  }, [state, toast]);

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
           <Link href="/" className="flex items-center justify-center gap-2 mb-4 text-sm text-zinc-400 underline underline-offset-4">
            <ArrowLeft className='size-5' />
            <span className=''>Go to Home Page</span>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Create an Account</h1>
            <p className="mt-2 text-muted-foreground">
              Get started with FormSet for free.
            </p>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="secondary">
                  <GoogleIcon className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="secondary">
                  <GitHubIcon className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required autoComplete='new-password' />
                </div>
                <SubmitButton />
              </form>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>
      </div >
      <AuthFeatures />
    </div >
  );
}
