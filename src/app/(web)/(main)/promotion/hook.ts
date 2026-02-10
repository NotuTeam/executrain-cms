/** @format */
import {
  useMutation,
  useQuery,
  UseQueryResult,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";

import {
  PromoListService,
  CreateService,
  DeleteService,
  ActivatePromoService,
  UpdateService,
} from "./handler";

interface UsePromoParams {
  promo_name?: string;
  is_active?: boolean | string;
  sort_order?: string;
}

export const usePromo = (
  params: UsePromoParams = {}
): UseInfiniteQueryResult<any> => {
  const { promo_name, is_active, sort_order = "desc" } = params;

  return useInfiniteQuery({
    queryKey: ["promo_list", promo_name, is_active, sort_order],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const { data, status } = await PromoListService({
          page: pageParam,
          promo_name,
          is_active,
          sort_order,
        });

        if (status !== 200) throw new Error();

        return data;
      } catch (e) {
        return { data: [], pagination: {} };
      }
    },
    getNextPageParam: (lastPage) => {
      // Return next page number if has_next is true, otherwise return undefined
      if (lastPage?.pagination?.has_next) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreatePromo = () => {
  return useMutation({
    mutationKey: ["create_promo"],
    mutationFn: async (payload: any) => {
      try {
        const response: any = await CreateService(payload);

        if (response.status !== 201) throw new Error(response.message);

        return {
          data: response.data,
        };
      } catch (error: any) {
        throw new Error(error.message || "Success to Add Promo");
      }
    },
  });
};

export const useUpdatePromo = () => {
  return useMutation({
    mutationKey: ["update_promo"],
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      try {
        const response: any = await UpdateService(id, data);

        if (response.status !== 200) throw new Error(response.message);

        return {
          data: response.message,
        };
      } catch (error: any) {
        throw new Error(error.message || "Success to Update Promo");
      }
    },
  });
};

export const useActivatePromo = () => {
  return useMutation({
    mutationKey: ["update_promo"],
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      try {
        const response: any = await ActivatePromoService(id, data);

        if (response.status !== 200) throw new Error(response.message);

        return {
          data: response.message,
        };
      } catch (error: any) {
        throw new Error(error.message || "Success to Update Promo");
      }
    },
  });
};

export const useDelete = () => {
  return useMutation({
    mutationKey: ["delete_promo"],
    mutationFn: async (payload: string) => {
      try {
        const response: any = await DeleteService(payload);

        if (response.status !== 200) throw new Error(response.message);

        return {
          data: response.data,
        };
      } catch (error: any) {
        throw new Error(error.message || "Success to Delete User");
      }
    },
  });
};

// export const useUser = (params: string): UseQueryResult<any> => {
//   const queryResult = useQuery({
//     queryKey: ["user", params],
//     queryFn: async () => {
//       const response = await UserListService();
//       return {};
//     },
//     enabled: !!params,
//     refetchOnWindowFocus: false,
//   });

//   return queryResult;
// };
