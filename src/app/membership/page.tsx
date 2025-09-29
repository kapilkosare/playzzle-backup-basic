
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star } from 'lucide-react';
import { InterestForm } from './interest-form';

const proFeatures = [
    "A new, exclusive puzzle delivered every day.",
    "Play unlimited puzzles created by the community.",
    "Save your progress on any puzzle and continue later.",
    "Access to special 'Pro' puzzle collections.",
    "An ad-free experience.",
];

export default function MembershipPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-3xl mx-auto text-center">
                <Star className="w-16 h-16 mx-auto text-amber-400 mb-4" />
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Piczzle Pro is Coming Soon!</h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-10">
                    Get ready to elevate your puzzle experience. We're putting the final touches on a premium membership packed with exclusive features.
                </p>
            </div>
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>What to Expect with Pro:</CardTitle>
                    <CardDescription>Unlock the ultimate Piczzle experience.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {proFeatures.map((feature, index) => (
                             <li key={index} className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <InterestForm />
        </div>
    );
}
