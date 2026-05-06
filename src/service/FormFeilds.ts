type YearOption = { label: string; value: string };

const DEFAULT_TARGET_YEAR_RANGE = 5;

const parseNeetDate = (neetDate?: Date | string): Date | undefined => {
  if (!neetDate) {
    return undefined;
  }

  if (neetDate instanceof Date) {
    return Number.isNaN(neetDate.getTime()) ? undefined : neetDate;
  }

  const trimmedDate = neetDate.trim();
  const yyyyMmDdMatch = trimmedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (yyyyMmDdMatch) {
    const [, year, month, day] = yyyyMmDdMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsedDate = new Date(trimmedDate);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
};

export const getNeetTargetYearOptions = (
  neetDate?: Date | string,
  range = DEFAULT_TARGET_YEAR_RANGE
): YearOption[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const safeRange =
    Number.isFinite(range) && range >= 0
      ? Math.floor(range)
      : DEFAULT_TARGET_YEAR_RANGE;

  let startYear = currentYear;
  const parsedNeetDate = parseNeetDate(neetDate);

  if (parsedNeetDate) {
    const examDateThisYear = new Date(
      currentYear,
      parsedNeetDate.getMonth(),
      parsedNeetDate.getDate(),
      23,
      59,
      59,
      999
    );

    if (now > examDateThisYear) {
      startYear = currentYear + 1;
    }
  }

  return Array.from({ length: safeRange + 1 }, (_, offset) => {
    const year = String(startYear + offset);
    return { label: year, value: year };
  });
};

export const INDIA_STATE_OPTIONS = [
  { label: "Andaman and Nicobar Islands", value: "Andaman and Nicobar Islands" },
  { label: "Andhra Pradesh", value: "Andhra Pradesh" },
  { label: "Arunachal Pradesh", value: "Arunachal Pradesh" },
  { label: "Assam", value: "Assam" },
  { label: "Bihar", value: "Bihar" },
  { label: "Chandigarh", value: "Chandigarh" },
  { label: "Chhattisgarh", value: "Chhattisgarh" },
  { label: "Dadra and Nagar Haveli and Daman and Diu", value: "Dadra and Nagar Haveli and Daman and Diu" },
  { label: "Delhi", value: "Delhi" },
  { label: "Goa", value: "Goa" },
  { label: "Gujarat", value: "Gujarat" },
  { label: "Haryana", value: "Haryana" },
  { label: "Himachal Pradesh", value: "Himachal Pradesh" },
  { label: "Jammu and Kashmir", value: "Jammu and Kashmir" },
  { label: "Jharkhand", value: "Jharkhand" },
  { label: "Karnataka", value: "Karnataka" },
  { label: "Kerala", value: "Kerala" },
  { label: "Ladakh", value: "Ladakh" },
  { label: "Lakshadweep", value: "Lakshadweep" },
  { label: "Madhya Pradesh", value: "Madhya Pradesh" },
  { label: "Maharashtra", value: "Maharashtra" },
  { label: "Manipur", value: "Manipur" },
  { label: "Meghalaya", value: "Meghalaya" },
  { label: "Mizoram", value: "Mizoram" },
  { label: "Nagaland", value: "Nagaland" },
  { label: "Odisha", value: "Odisha" },
  { label: "Puducherry", value: "Puducherry" },
  { label: "Punjab", value: "Punjab" },
  { label: "Rajasthan", value: "Rajasthan" },
  { label: "Sikkim", value: "Sikkim" },
  { label: "Tamil Nadu", value: "Tamil Nadu" },
  { label: "Telangana", value: "Telangana" },
  { label: "Tripura", value: "Tripura" },
  { label: "Uttar Pradesh", value: "Uttar Pradesh" },
  { label: "Uttarakhand", value: "Uttarakhand" },
  { label: "West Bengal", value: "West Bengal" } ];

const baseSignUpFields = [
  [
    {
      idx: 0,
      inputType: "text",
      placeholderName: "First Name",
      id: "firstName",
      fieldType: "input",
      show: true,
      required: true,
      page: 1,
      error: "" }, {
      idx: 1,
      inputType: "text",
      placeholderName: "Last Name",
      fieldType: "input",
      show: true,
      required: true,
      page: 1,
      error: "",
      id: "lastName" }, {
      idx: 2,
      inputType: "text",
      placeholderName: "Gender",
      fieldType: "select",
      label: [
        { label: "Male", value: "M" },
        { label: "Female", value: "F" },
        { label: "Others", value: "O" } ],
      page: 1,
      error: "",
      required: true,
      id: "gender",
      show: true }, {
      idx: 3,
      inputType: "text",
      placeholderName: "State",
      fieldType: "select",
      label: INDIA_STATE_OPTIONS,
      page: 1,
      error: "",
      required: true,
      id: "state",
      show: true }, {
      idx: 4,
      inputType: "text",
      placeholderName: "Email",
      fieldType: "input",
      page: 1,
      error: "Email not valid",
      id: "email",
      required: true,
      show: true }, {
      idx: 4.1,
      inputType: "text",
      placeholderName: "Phone number",
      fieldType: "input",
      page: 1,
      required: true,
      error: "Required 10 digits",
      id: "phoneNo",
      show: true }, {
      idx: 5,
      inputType: "date",
      placeholderName: "DOB",
      fieldType: "date",
      show: true,
      required: true,
      page: 1,
      error: "",
      id: "dob" } ],
  [
    {
      idx: 6,
      inputType: "text",
      placeholderName: "Standard",
      fieldType: "select",
      label: [
        { label: "11th", value: "XI" },
        { label: "12th", value: "XII" },
        { label: "Repeater", value: "R" },
        { label: "Crash Course", value: "C" } ],
      page: 2,
      required: true,
      error: "",
      id: "std",
      show: true }, {
      idx: 7,
      inputType: "text",
      placeholderName: "NEET Target Year",
      fieldType: "select",
      label: [
        { label: "2026", value: "2026" },
        { label: "2027", value: "2027" },
        { label: "2028", value: "2028" },
        { label: "2029", value: "2029" },
        { label: "2030", value: "2030" } ],
      page: 2,
      required: true,
      error: "",
      id: "targetYear",
      show: true }, {
      idx: 8,
      inputType: "password",
      placeholderName: "Password",
      fieldType: "input",
      page: 2,
      error: "Password should contain 1 Special Character",
      required: true,
      id: "password",
      show: true }, {
      idx: 9,
      inputType: "password",
      placeholderName: "Confirm Password",
      fieldType: "input",
      page: 2,
      error: "Passwords do not match",
      required: true,
      id: "confirmPassword",
      show: true }, {
      idx: 10,
      inputType: "text",
      placeholderName: "School Name",
      fieldType: "input",
      page: 2,
      required: true,
      error: "Required 10 digits",
      id: "schoolName",
      show: true }, {
      idx: 11,
      inputType: "text",
      placeholderName: "School Pincode",
      fieldType: "input",
      page: 2,
      required: true,
      error: "Required 6 digits",
      id: "schoolPin",
      show: true } ],
];

export const createSignUpFields = (neetDate?: Date | string) => {
  const signUpFields = JSON.parse(JSON.stringify(baseSignUpFields));
  const targetYearField = signUpFields?.[1]?.find(
    (field: any) => field?.id === "targetYear" || field?.idx === 7
  );

  if (targetYearField) {
    targetYearField.label = getNeetTargetYearOptions(neetDate);
  }

  return signUpFields;
};

// Deprecated static fallback for legacy consumers.
export const SignUpFields = createSignUpFields();

export const LoginFields = [
  {
    idx: 0,
    inputType: "text",
    placeholderName: "Mobile Number",
    fieldType: "input",
    required: true,
    error: "Required 10 digits",
    icon: "faUser",
    id: "phoneNo",
    show: true,
    phonePad: true }, {
    idx: 1,
    inputType: "password",
    placeholderName: "Password",
    required: true,
    error: "Required Minimum 8 characters",
    fieldType: "input",
    icon: "passIcon",
    order: 1,
    id: "password",
    show: true,
    phonePad: false } ];

export const ResetFields = [
  {
    idx: 0,
    inputType: "password",
    placeholderName: "Password",
    fieldType: "input",
    required: true,
    error: "Required Minimum 8 characters",
    icon: "faUser",
    id: "password",
    show: true,
    phonePad: false }, {
    idx: 1,
    inputType: "password",
    placeholderName: "Confirm Password",
    required: true,
    error: "Required Minimum 8 characters",
    fieldType: "input",
    icon: "passIcon",
    order: 1,
    id: "confirmPassword",
    show: true,
    phonePad: false } ];

const baseProfileFields = [
  {
    idx: 0,
    name: "firstName",
    inputType: "text",
    placeholderName: "First Name",
    fieldType: "input",
    required: true,
    error: "",
    id: "firstName",
    show: true }, {
    idx: 1,
    name: "lastName",
    id: "lastName",
    inputType: "text",
    placeholderName: "Last Name",
    fieldType: "input",
    required: true,
    error: "",
    show: true }, {
    idx: 2,
    inputType: "text",
    placeholderName: "Gender",
    fieldType: "select",
    label: [
      { label: "Male", value: "M" },
      { label: "Female", value: "F" },
      { label: "Others", value: "O" } ],
    page: 1,
    error: "",
    required: true,
    id: "gender",
    show: true }, {
    idx: 3,
    name: "std",
    inputType: "text",
    placeholderName: "Current Status",
    fieldType: "select",
    value: "std",
    id: "std",
    label: [
      { label: "11th", value: "XI" },
      { label: "12th", value: "XII" },
      { label: "Repeater", value: "R" },
      { label: "Crash Course", value: "C" } ],
    required: true,
    error: "",
    show: true }, {
    idx: 4,
    inputType: "text",
    placeholderName: "State",
    fieldType: "select",
    label: INDIA_STATE_OPTIONS,
    page: 1,
    error: "",
    required: true,
    id: "state",
    show: true }, {
    idx: 5,
    name: "email",
    inputType: "text",
    placeholderName: "Email",
    fieldType: "input",
    id: "email",
    required: true,
    error: "Email not valid",
    show: true }, {
    idx: 6,
    name: "targetYear",
    id: "targetYear",
    inputType: "text",
    placeholderName: "Target Year",
    fieldType: "select",
    label: [
      { label: "2024", value: "2024" },
      { label: "2025", value: "2025" },
      { label: "2026", value: "2025" },
      { label: "2027", value: "2026" } ],
    required: true,
    error: "",
    show: true }, {
    idx: 7,
    name: "phoneNo",
    id: "phoneNo",
    inputType: "text",
    placeholderName: "Phone Number",
    fieldType: "input",
    required: true,
    error: "Required 10 digits",
    show: true }, // {
  //   idx: 8,
  //   name: "pincode",
  //   inputType: "text",
  //   id: "pincode",
  //   placeholderName: "Pincode",
  //   fieldType: "input",
  //   required: true,
  //   error: "Required 6 digits",
  //   show: false,
  // },
  {
    idx: 8,
    inputType: "text",
    placeholderName: "School Name",
    fieldType: "input",
    page: 2,
    required: false,
    error: "",
    id: "schoolName",
    show: true }, {
    idx: 9,
    inputType: "text",
    placeholderName: "School Pincode",
    fieldType: "input",
    page: 2,
    required: false,
    error: "Required 6 digits",
    id: "schoolPin",
    show: true }, {
    idx: 10,
    inputType: "date",
    placeholderName: "DOB",
    fieldType: "date",
    show: true,
    required: true,

    page: 1,
    error: "",
    id: "dob" } ];

export const createProfileFields = (neetDate?: Date | string) => {
  const profileFields = JSON.parse(JSON.stringify(baseProfileFields));
  const targetYearField = profileFields?.find(
    (field: any) => field?.id === "targetYear" || field?.name === "targetYear"
  );

  if (targetYearField) {
    targetYearField.label = getNeetTargetYearOptions(neetDate);
  }

  return profileFields;
};

export const ProfileFields = createProfileFields();

export const SearchFields = [
  {
    inputType: "text",
    placeholderName: "search",
    fieldType: "input",
    show: true } ];

//
