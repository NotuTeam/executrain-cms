/** @format */

import {
  useMutation,
  useQuery,
  UseQueryResult,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import {
  CareerListService,
  CareerDetailService,
  CreateCareerService,
  UpdateCareerService,
  DeleteCareerService,
  ApplicantsListService,
  ApplicantDetailService,
  UpdateApplicantStatusService,
  DeleteApplicantService,
} from "./handler";

interface UseCareersParams {
  department?: string;
  location?: string;
  job_type?: string;
  experience_level?: string;
  status?: string;
  search?: string;
  sort_order?: string;
}

export const useCareers = (
  params: UseCareersParams = {}
): UseInfiniteQueryResult<any> => {
  const { department, location, job_type, experience_level, status: statusParam, search, sort_order = "desc" } =
    params;

  return useInfiniteQuery({
    queryKey: ["career_list", department, location, job_type, experience_level, statusParam, search, sort_order],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const { data, status: responseStatus } = await CareerListService({
          page: pageParam,
          department,
          location,
          job_type,
          experience_level,
          status: statusParam,
          search,
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

export const useCareerDetail = (param: string): UseQueryResult<any> => {
  return useQuery({
    queryKey: ["career_detail", param],
    queryFn: async () => {
      try {
        const { data, status } = await CareerDetailService(param);

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

export const useCreateCareer = () => {
  return useMutation({
    mutationKey: ["create_career"],
    mutationFn: async (payload: any) => {
      try {
        const response: any = await CreateCareerService(payload);

        if (response.status !== 201) throw new Error(response.message);

        return {
          data: response.data,
        };
      } catch (error: any) {
        throw new Error(error.message || "Failed to Add Career");
      }
    },
  });
};

export const useUpdateCareer = () => {
  return useMutation({
    mutationKey: ["update_career"],
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      try {
        const response: any = await UpdateCareerService(id, data);

        if (response.status !== 200) throw new Error(response.message);

        return {
          data: response.data,
        };
      } catch (error: any) {
        throw new Error(error.message || "Failed to Update Career");
      }
    },
  });
};

export const useDeleteCareer = () => {
  return useMutation({
    mutationKey: ["delete_career"],
    mutationFn: async (payload: string) => {
      try {
        const response: any = await DeleteCareerService(payload);

        if (response.status !== 200) throw new Error(response.message);

        return {
          data: response.data,
        };
      } catch (error: any) {
        throw new Error(error.message || "Failed to Delete Career");
      }
    },
  });
};

// Applicants Hooks
export const useApplicants = (
  careerId: string,
  params: any = {}
): UseInfiniteQueryResult<any> => {
  const { status, search } = params;

  return useInfiniteQuery({
    queryKey: ["applicants_list", careerId, status, search],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const { data, status: statusCode } = await ApplicantsListService(careerId, {
          page: pageParam,
          status,
          search,
        });

        if (statusCode !== 200) throw new Error();

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
    enabled: !!careerId,
  });
};

export const useApplicantDetail = (param: string): UseQueryResult<any> => {
  return useQuery({
    queryKey: ["applicant_detail", param],
    queryFn: async () => {
      try {
        const { data, status } = await ApplicantDetailService(param);

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

export const useUpdateApplicantStatus = () => {
  return useMutation({
    mutationKey: ["update_applicant_status"],
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      try {
        const response: any = await UpdateApplicantStatusService(id, { status, notes });

        if (response.status !== 200) throw new Error(response.message);

        return {
          data: response.data,
        };
      } catch (error: any) {
        throw new Error(error.message || "Failed to Update Applicant Status");
      }
    },
  });
};

export const useDeleteApplicant = () => {
  return useMutation({
    mutationKey: ["delete_applicant"],
    mutationFn: async (payload: string) => {
      try {
        const response: any = await DeleteApplicantService(payload);

        if (response.status !== 200) throw new Error(response.message);

        return {
          data: response.data,
        };
      } catch (error: any) {
        throw new Error(error.message || "Failed to Delete Applicant");
      }
    },
  });
};
