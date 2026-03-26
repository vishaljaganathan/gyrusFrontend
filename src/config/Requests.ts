import React from "react";
import axios from "axios";
import { axiosInstance } from "./indeceptor";

export function getRequest(URL: string) {
  return axiosInstance.get(`/${URL}`).then((response) => response);
}

export function postRequest({ URL, payload }: any) {
  return axiosInstance.post(`/${URL}`, payload).then((response: any) => response)
}

export function putRequest({ URL, payload }: any) {
  return axiosInstance.put(`/${URL}`, payload).then((response: any) => response);
}

export function deleteRequest(URL: string) {
  return axiosInstance.delete(`/${URL}`).then((response) => response);
}
