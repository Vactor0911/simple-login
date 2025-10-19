import { keyframes } from "@emotion/react";
import { Paper, Stack, type PaperProps } from "@mui/material";
import type { ReactNode } from "react";

interface PageWrapperProps extends PaperProps {
  children: ReactNode;
}

const FadeInAnimation = keyframes`
    0% {
        transform: translateY(-20%) scale(1.1);
        opacity: 0;
    }
    75% {
        opacity: 1;
        transform: translateY(2%) scale(1);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
`;

const PageWrapper = (props: PageWrapperProps) => {
  const { children, sx, ...others } = props;

  return (
    <Stack
      width="100vw"
      height="100vh"
      justifyContent="center"
      alignItems="center"
    >
      <Paper
        elevation={3}
        sx={{
          padding: "32px 40px",
          backgroundColor: "#313338",
          animation: `${FadeInAnimation} 0.5s ease-in-out forwards`,
          borderRadius: 3,
          ...sx,
        }}
        {...others}
      >
        {children}
      </Paper>
    </Stack>
  );
};

export default PageWrapper;
