import {
  IconLookup,
  IconName,
  IconPrefix,
} from "@fortawesome/free-solid-svg-icons";

export interface ModalProps {
  showModal: boolean;
  showEmoji?: boolean;
  modelData?: PopupModal[];
  setShowModal: (open: boolean) => void;
  setSub: (sub: string) => void;
  setSubImage: (Image: any) => void;
  streakData?: { active: number; inactive: number };
  report?: { label: string; value: string }[];

}
export interface score {
  id: number;
  score: string

}
export type IconProp = IconName | [IconPrefix, IconName] | IconLookup;
export interface PopupModal {
  id?: number;
  img?: any;
  sub?: string;
  subject?: string;
  subjectId?: string;
  report?: string;
  value?: string;
  label?: string;
  lock?: boolean;
  title?: string;
  date?: string;
  streaks?: boolean;
  percentage?: string;
  openTest?: boolean;
  plan?: boolean;
  expiryDate?: string;
}

export interface LoginProps {
  index?: number;
  inputType?: "text" | "password" | string;
  placeholderName?: string | undefined;
  componentName?: string;
  fieldType?: string;
  userValue?: string | undefined;
  data?: any;
  // value?:string ;
  keys?: number;
  label?: any;
  text?: string | undefined;
  value?: string | undefined;
  // }[] ;
  disable?: boolean;
  size?: number;
  show?: boolean;
  setUserName?: (userName: string) => void;
  setPassword?: (password: string) => void;
  setName?: (name: string) => void;
  setstandard?: (std: string) => void;
  setPincode?: (pincode: string) => void;
  setEmail?: (Email: string) => void;
  setyear?: (year: string) => void;
  setPhoneNo?: (phoneNo: string) => void;
  setconfirmPassword?: (confirmPassword: string) => void;
  setMailVaidate?: (mailVaidate: boolean) => void;
  setColorVaidate?: (colorVaidate: boolean) => void;
  setPasswordValidation?: (PasswordValidation: boolean) => void;
}

export interface RadioButtonProps {
  labelName?: string;
  options?: { label: string; value: string }[];
  reportOptions?: { label: string; value: string }[];
  ArrData?: any;
  id?: string;
  // MCQ:{_id:string,key:string,value:string}[]
  MCQ: any;
  report?: { label: string; value: string }[];
  keys?: any;
  keyName?: string;
  answer?: string;
  showAnswer: boolean
  setSelectedIndex: Function;
  selectedIndex: any;
}
export interface ButtonProps {
  width: number;
  height: number;
  textSize: number;
  color?: string;
  text: any;
  backgroundColor: string;
  textColor?: string;
  disabled?: boolean;
  onSubmit?: (e: any) => void;
  callback?: () => void;
}

export interface userProps {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  gender?: string;
  password?: string;
  dob?: any;
  phoneNo?: string;
  std?: string;
  targetYear?: string;
  pinCode?: string;
  schoolName?: string;
  schoolPin?: string;
  residentialPin?: string;
  plan?: string;
  planValid?: boolean;
  planExpiry?: Date;
  examDate?: string;
  neet?: {
    percentage?: number;
    streak?: number;
    updatedAt?: Date;
  };
  physics?: {
    percentage?: number;
    streak?: number;
    updatedAt?: Date;
  };
  chemistry?: {
    percentage?: number;
    streak?: number;
    updatedAt?: Date;
  };
  botany?: {
    percentage?: number;
    streak?: number;
    updatedAt?: Date;
  };
  zoology?: {
    percentage?: number;
    streak?: number;
    updatedAt?: Date;
  };
  active?: {
    days?: number;
    updatedAt?: Date;
  };
  inActive?: number;
  key?: string;
  notificationId?: any;
  accessToken?: string;
  accType?: string;
}

export interface quesProps {
  qtn?: string;
  options?: [{ label: string; value: string }];
  explanation?: string;
  keyName: string;
}

export interface ScreenWithBackgroundProps {
  children: React.ReactNode;
}

export interface TestProps {
  StartTest: () => void;
}
