export type ApiResponse<TResult> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: TResult;
};
