
// src/app/super-admin/settings/page.tsx
'use server';

import { getAuthenticatedUser } from "@/lib/firebase/server-auth";
import { redirect } from "next/navigation";
import { getSiteSettings, updateSiteSettings } from "./actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function handleSubmit(formData: FormData) {
    'use server';
    const mobilePlayEnabled = formData.get('mobilePlayEnabled') === 'on';
    await updateSiteSettings({ mobilePlayEnabled });
}

export default async function SuperAdminSettingsPage() {
    const user = await getAuthenticatedUser();
    if (!user || !user.customClaims?.superadmin) {
        redirect('/');
    }

    const settings = await getSiteSettings();

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-2xl mx-auto">
                 <Button asChild variant="outline" className="mb-4">
                    <Link href="/super-admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
                 <h1 className="text-3xl font-bold mb-8">Site Settings</h1>
                 <form action={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Gameplay Settings</CardTitle>
                            <CardDescription>Manage global settings for the puzzle gameplay experience.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="mobilePlayEnabled" className="text-base">
                                        Enable Mobile Gameplay
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow users to play puzzles on mobile phones. Recommended to keep disabled for a better user experience on larger screens.
                                    </p>
                                </div>
                                 <Switch
                                    id="mobilePlayEnabled"
                                    name="mobilePlayEnabled"
                                    defaultChecked={settings.mobilePlayEnabled}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit">Save Settings</Button>
                        </CardFooter>
                    </Card>
                 </form>
            </div>
        </div>
    );
}
