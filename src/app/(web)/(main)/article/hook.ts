/** @format */

import {
  useMutation,
  useQuery,
  UseQueryResult,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import {
  ArticleListService,
  ArticleDetailService,
  CreateArticleService,
  UpdateArticleService,
  DeleteArticleService,
} from "./handler";

interface UseArticlesParams {
  category?: string;
  search?: string;
  tag?: string;
  status?: string;
  sort_order?: string;
}

export const useArticles = (
  params: UseArticlesParams = {}
): UseInfiniteQueryResult<any> => {
  const { category, search, tag, status: statusParam, sort_order = "desc" } = params;

  return useInfiniteQuery({
    queryKey: ["article_list", category, search, tag, statusParam, sort_order],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const { data, status: responseStatus } = await ArticleListService({
          page: pageParam,
          category,
          search,
          tag,
          status: statusParam,
          sort_order,
        });

        if (responseStatus !== 200) throw new Error();

        return data;
      } catch (e) {
        return { data: [], pagination: {} };
      }
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.has_next) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    refetchOnWindowFocus: false,
  });
};

export const useArticleDetail = (param: string): UseQueryResult<any> => {
  return useQuery({
    queryKey: ["article_detail", param],
    queryFn: async () => {
      try {
        const { data, status } = await ArticleDetailService(param);

        if (status !== 200) throw new Error();

        return data;
      } catch (e) {
        return {};
      }
    },
    enabled: !!param,
    refetchOnWindowFocus: false,
  });
};

export const useCreateArticle = () => {
  return useMutation({
    mutationKey: ["create_article"],
    mutationFn: async (payload: any) => {
      try {
        const response: any = await CreateArticleService(payload);

        if (response.status !== 201) throw new Error(response.message);

        return {
          data: response.data,
        };
      } catch (error: any) {
        throw new Error(error.message || "Failed to Add Article");
      }
    },
  });
};

export const useUpdateArticle = () => {
  return useMutation({
    mutationKey: ["update_article"],
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      try {
        const response: any = await UpdateArticleService(id, data);

        if (response.status !== 200) throw new Error(response.message);

        return {
          data: response.data,
        };
      } catch (error: any) {
        throw new Error(error.message || "Failed to Update Article");
      }
    },
  });
};

export const useDeleteArticle = () => {
  return useMutation({
    mutationKey: ["delete_article"],
    mutationFn: async (payload: string) => {
      try {
        const response: any = await DeleteArticleService(payload);

        if (response.status !== 200) throw new Error(response.message);

        return {
          data: response.data,
        };
      } catch (error: any) {
        throw new Error(error.message || "Failed to Delete Article");
      }
    },
  });
};
