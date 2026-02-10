/** @format */

import AxiosClient from "@/lib/axios";

const headers = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

interface CareerListParams {
  page?: number;
  department?: string;
  location?: string;
  job_type?: string;
  experience_level?: string;
  status?: string;
  search?: string;
  sort_order?: string;
}

export async function CareerListService(params: CareerListParams = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) {
      queryParams.append("page", params.page.toString());
    }

    if (params.department) {
      queryParams.append("department", params.department);
    }

    if (params.location) {
      queryParams.append("location", params.location);
    }

    if (params.job_type) {
      queryParams.append("job_type", params.job_type);
    }

    if (params.experience_level) {
      queryParams.append("experience_level", params.experience_level);
    }

    if (params.status) {
      queryParams.append("status", params.status);
    }

    if (params.search) {
      queryParams.append("search", params.search);
    }

    if (params.sort_order) {
      queryParams.append("sort_order", params.sort_order);
    }

    const queryString = queryParams.toString();
    const url = `/career/list${queryString ? `?${queryString}` : ""}`;

    const { data: response } = await AxiosClient.get(url);

    const { status, message, data, pagination } = response;

    if (status !== 200) throw new Error(message);

    return {
      status,
      message,
      data: {
        data,
        pagination,
      },
    };
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

export async function CareerDetailService(id: string) {
  try {
    const { data: response } = await AxiosClient.get(`/career/detail/${id}`);

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

export async function CreateCareerService(payload: any) {
  try {
    const { data: response } = await AxiosClient.post("/career/add", payload, headers);

    const { status, message, data } = response;

    if (status !== 201) throw new Error(message);

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

export async function UpdateCareerService(id: string, payload: any) {
  try {
    const { data: response } = await AxiosClient.put(
      `/career/adjust/${id}`,
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

export async function DeleteCareerService(payload: string) {
  try {
    const { data: response } = await AxiosClient.delete(`/career/takedown/${payload}`);

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

// Applicants Services
export async function ApplicantsListService(careerId: string, params: any = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) {
      queryParams.append("page", params.page.toString());
    }

    if (params.status) {
      queryParams.append("status", params.status);
    }

    if (params.search) {
      queryParams.append("search", params.search);
    }

    const queryString = queryParams.toString();
    const url = `/career/${careerId}/applicants${queryString ? `?${queryString}` : ""}`;

    const { data: response } = await AxiosClient.get(url);

    const { status, message, data, pagination } = response;

    if (status !== 200) throw new Error(message);

    return {
      status,
      message,
      data: {
        data,
        pagination,
      },
    };
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

export async function ApplicantDetailService(id: string) {
  try {
    const { data: response } = await AxiosClient.get(`/career/applicant/${id}`);

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

export async function UpdateApplicantStatusService(id: string, payload: any) {
  try {
    const { data: response } = await AxiosClient.put(
      `/career/applicant/${id}/status`,
      payload
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

export async function DeleteApplicantService(id: string) {
  try {
    const { data: response } = await AxiosClient.delete(`/career/applicant/${id}`);

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
