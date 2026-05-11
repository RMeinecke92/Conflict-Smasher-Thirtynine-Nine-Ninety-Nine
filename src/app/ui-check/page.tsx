"use client";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormValues = {
  note: string;
};

export default function UiCheckPage() {
  const form = useForm<FormValues>({
    defaultValues: { note: "" },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-8">
      <div className="flex flex-col items-center gap-2">
        <Button type="button">shadcn Button</Button>
        <p className="text-sm text-muted-foreground">
          Phase 1 verification — primary button styling
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Card + form</CardTitle>
          <CardDescription>
            Label, Input, and react-hook-form wrappers
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(() => {})}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="standalone-input">Standalone label</Label>
                <Input id="standalone-input" placeholder="Optional" />
              </div>
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form label</FormLabel>
                    <FormControl>
                      <Input placeholder="Type something" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit">Submit</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
