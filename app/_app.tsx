import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const MyApp = ({ Component, pageProps }: AppProps) => {
  const queryClient = new QueryClient(); // 在这里创建 QueryClient 实例

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default MyApp;
