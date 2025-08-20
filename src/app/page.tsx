import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Bot, Rows, Share2, BarChart, Edit } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const features = [
    {
      icon: <Edit className="h-8 w-8 text-primary" />,
      title: 'Intuitive Form Builder',
      description: 'Create beautiful, responsive forms with our easy-to-use builder. No coding required.',
    },
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: 'AI-Powered Suggestions',
      description: 'Get smart suggestions for your form fields based on your goals, powered by AI.',
    },
    {
      icon: <Rows className="h-8 w-8 text-primary" />,
      title: 'Multiple Field Types',
      description: 'From simple text inputs to file uploads and date pickers, we have you covered.',
    },
    {
      icon: <Share2 className="h-8 w-8 text-primary" />,
      title: 'Easy Sharing',
      description: 'Share your forms with a unique link and collect responses from anyone, anywhere.',
    },
    {
      icon: <BarChart className="h-8 w-8 text-primary" />,
      title: 'Response Analytics',
      description: 'View and analyze your form responses in a clean, organized dashboard.',
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: 'Secure & Reliable',
      description: 'Your data is safe with us. We use industry-standard security practices.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="font-bold text-2xl">FormFlow</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up Free</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
              Create Powerful Forms, Effortlessly
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Build, share, and analyze forms with FormFlow. From simple surveys to complex registrations, we provide the tools you need to succeed.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started for Free</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="relative container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-xl shadow-2xl overflow-hidden border">
                <Image
                    src="https://placehold.co/1200x600.png"
                    width={1200}
                    height={600}
                    alt="FormFlow App Screenshot"
                    className="w-full h-auto"
                    data-ai-hint="dashboard forms"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
            </div>
        </section>

        <section className="bg-background py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need to collect data</h2>
              <p className="mt-4 text-lg text-muted-foreground">Powerful features to streamline your data collection process.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card text-card-foreground text-center">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-lg w-16 h-16 flex items-center justify-center">
                      {feature.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to build your first form?</h2>
                <p className="mt-4 text-lg text-muted-foreground">Join thousands of creators and start collecting responses today. It's free to get started.</p>
                <div className="mt-8">
                    <Button size="lg" asChild>
                        <Link href="/signup">Create Your FormFlow Account</Link>
                    </Button>
                </div>
            </div>
        </section>

      </main>

      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="font-semibold">FormFlow</span>
          </div>
          <p className="text-muted-foreground text-sm mt-4 sm:mt-0">&copy; {new Date().getFullYear()} FormFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
