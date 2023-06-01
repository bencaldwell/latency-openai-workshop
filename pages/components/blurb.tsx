import { Card, CardContent } from "@mui/material";

interface Props {
  generatingPost: string;
}

export default function Blurb({ generatingPost }: Props) {
  return (
    <Card>
      <CardContent>{generatingPost}</CardContent>
    </Card>
  );
}