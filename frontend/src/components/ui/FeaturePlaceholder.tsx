import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface FeaturePlaceholderProps {
  title: string;
  description: string;
  message: string;
  comingSoonText?: string;
}

export const FeaturePlaceholder = ({
  title,
  description,
  message,
  comingSoonText = "Em breve você poderá utilizar esta funcionalidade aqui."
}: FeaturePlaceholderProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-12">
          <p>{message}</p>
          <p className="text-sm">{comingSoonText}</p>
        </div>
      </CardContent>
    </Card>
  );
};