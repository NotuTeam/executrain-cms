/** @format */

import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  ScheduleListService,
  ScheduleDetailService,
  CreateService,
  CreateBulkService,
  UpdateService,
  DeleteService,
} from "./handler";

export const useSchedules = (product_id?: string): UseQueryResult<any> => {
  return useQuery({
    queryKey: ["schedule_list", product_id],
    queryFn: async () => {
      try {
        const { data, status } = await ScheduleListService(product_id);

        if (status !== 200) throw new Error();

        return data;
      } catch (e) {
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });
};

export const useSchedulesDetail = (param: string): UseQueryResult<any> => {
  return useQuery({
    queryKey: ["schedule_detail", param],
    queryFn: async () => {
      try {
        const { data, status } = await ScheduleDetailService(param);

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

export const useCreateSchedule = () => {
  return useMutation({
    mutationKey: ["create_schedule"],
    mutationFn: async (payload: any) => {
      try {
        const response: any = await CreateService(payload);

        if (response.status !== 201) throw new Error(response.message);

        return {
          data: response.data,
        };
      } catch (error: any) {
        throw new Error(error.message || "Success to Add Schedule");
      }
    },
  });
};

export const useCreateBulkSchedule = () => {
  return useMutation({
    mutationKey: ["create_bulk_schedule"],
    mutationFn: async ({ payload, product_id }: { payload: any; product_id: string }) => {
      try {
        const response: any = await CreateBulkService(payload, product_id);

        if (response.status !== 201) throw new Error(response.message);

        return {
          data: response.data,
        };
      } catch (error: any) {
        throw new Error(error.message || "Success to Import Schedule");
      }
    },
  });
};

export const useUpdateSchedule = () => {
  return useMutation({
    mutationKey: ["update_schedule"],
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      try {
        const response: any = await UpdateService(id, data);

        if (response.status !== 200) throw new Error(response.message);

        return {
          data: response.data,
        };
      } catch (error: any) {
        throw new Error(error.message || "Success to Update Schedule");
      }
    },
  });
};

export const useDelete = () => {
  return useMutation({
    mutationKey: ["delete_schedule"],
    mutationFn: async (payload: string) => {
      try {
        const response: any = await DeleteService(payload);

        if (response.status !== 200) throw new Error(response.message);

        return {
          data: response.data,
        };
      } catch (error: any) {
        throw new Error(error.message || "Success to Delete Schedule");
      }
    },
  });
};
