/** @format */

import AxiosClient from "@/lib/axios";

const headers = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

export async function ScheduleListService(product_id?: string) {
  try {
    const url = product_id
      ? `/schedule/list?product_id=${product_id}`
      : "/schedule/list";

    const { data: response } = await AxiosClient.get(url);

    const { status, message, data } = response;

    if (status !== 200) throw new Error(message);

    return {
      status,
      message,
      data,
    };
  } catch (error: any) {
    console.log(error);
    return error.message;
  }
}

export async function ScheduleDetailService(id: string) {
  try {
    const { data: response } = await AxiosClient.get(`/schedule/detail/${id}`);

    const { status, message, data } = response;

    if (status !== 200) throw new Error(message);

    return {
      status,
      message,
      data,
    };
  } catch (error: any) {
    console.log(error);
    return error.message;
  }
}

export async function CreateService(payload: any) {
  try {
    const { data: response } = await AxiosClient.post(
      "/schedule/add",
      payload,
      headers
    );

    const { status, message, data } = response;

    if (status !== 201) throw new Error(message);

    return {
      status,
      message,
      data,
    };
  } catch (error: any) {
    console.log(error);
    return (
      error?.response?.data || {
        status: 500,
        message: "Failed to create schedule",
      }
    );
  }
}

export async function CreateBulkService(payload: any, product_id: string) {
  try {
    const { data: response } = await AxiosClient.post("/schedule/add-bulk", {
      data: payload,
      product_id,
    });

    const { status, message, data } = response;

    if (status !== 201) throw new Error(message);

    return {
      status,
      message,
      data,
    };
  } catch (error: any) {
    console.log(error);
    return (
      error?.response?.data || {
        status: 500,
        message: "Failed to create schedule",
      }
    );
  }
}

export async function BulkCreateService(schedules: any[]) {
  try {
    const results = [];
    for (const schedule of schedules) {
      const result = await CreateService(schedule);
      results.push(result);
    }
    return results;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data;
  }
}

export async function UpdateService(id: string, payload: any) {
  try {
    const { data: response } = await AxiosClient.put(
      `/schedule/adjust/${id}`,
      payload,
      headers
    );

    const { status, message, data } = response;

    if (status !== 200) throw new Error(message);

    return {
      status,
      message,
      data,
    };
  } catch (error: any) {
    console.log(error);
    return error?.response?.data;
  }
}

export async function DeleteService(payload: string) {
  try {
    const { data: response } = await AxiosClient.delete(
      `/schedule/takedown/${payload}`
    );

    const { status, message } = response;

    if (status !== 200) throw new Error(message);

    return {
      status,
      message,
    };
  } catch (error: any) {
    console.log(error);
    return error?.response?.data;
  }
}
