import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { Grid } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";

import { useState } from "react";
import { useSession } from "next-auth/react";

const styles = {
  details: {
    padding: "1rem",
    borderTop: "1px solid #e1e1e1"
  },
  value: {
    padding: "1rem 2rem",
    borderTop: "1px solid #e1e1e1",
    color: "#899499"
  }
};

export default function ProfileCard(props: any) {
  const { data: session } = useSession();
  const [uploadedImg, setUploadedImage] = useState<File | null>(null);

  const updatePhoto = async (file: File) => {
    if (session === null || file === null) {
      return;
    }
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);
      formData.append('userId', session.user.id.toString());
      const response = await fetch('http://localhost:3000/api/profile', {
        method: 'POST',
        body: formData
      });
      const user = await response.json();
      session.user.profilePicture = user.profilePicture;
      if (!response.ok) {
        console.log(response);
        throw new Error('Failed to update profile pic');
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  return (
    <Card variant="outlined">
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item sx={{ p: "1.5rem 0rem", textAlign: "center" }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <Button 
                variant="contained"
                component="label"
              >
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setUploadedImage(e.target.files[0]);
                      await updatePhoto(e.target.files[0]);
                    } else {
                      console.log("upload button didn't trigger");
                    }
                  }}
                />
                <PhotoCameraIcon
                  sx={{
                    border: "5px solid white",
                    backgroundColor: "#ff558f",
                    borderRadius: "50%",
                    padding: ".2rem",
                    width: 35,
                    height: 35
                  }}
                />
              </Button>
            }
          >
            <Avatar
              sx={{ width: 100, height: 100, mb: 1.5 }}
              src={uploadedImg ? URL.createObjectURL(uploadedImg) : (session ? session.user.profilePicture : 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg')}
            />
          </Badge>

          <Typography variant="h6">{props.name}</Typography>
          <Typography color="text.secondary">{props.sub}</Typography>
        </Grid>
      </Grid>
    </Card>
  );
}
