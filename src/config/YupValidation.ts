import * as Yup from "yup";

// firstName: "",
//     lastName: "",
//     gender: "",
//     std: "",
//     email: "",
//     targetYear: "",
//     phoneNo: "",
//     password: "",
//     pincode: "",
//     schoolName: "",
//     schoolPin: "",
//     residentialPin: "",
export const SignupSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  lastName: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  gender: Yup.string().required("Required"),
  std: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  targetYear: Yup.date().required("Required"),
  phoneNo: Yup.string()
    .min(10, "Minimum 10 digit number!")
    .max(10, "Maximum 10 digit number!")
    .required("Required"),
  password: Yup.string()
    .required("No password provided.")
    .min(8, "Password is too short - should be 8 chars minimum.")
    .matches(/[a-zA-Z]/, "Password can only contain Latin letters."),
  pinCode: Yup.string()
    .matches(/^\d{6}$/, { message: "Pincode must be exactly 6 digits", excludeEmptyString: true }),
  schoolPin: Yup.string()
    .matches(/^\d{6}$/, { message: "School pincode must be exactly 6 digits", excludeEmptyString: true }),
});

export const initialValue: any = {
  firstName: "",
  lastName: "",
  gender: "",
  email: "",
  phoneNo: "",
  pinCode: "",
  std: "",
  targetYear: "",
  password: "",
  schoolName: "",
  schoolPin: "",
  residentialPin: "",
};
