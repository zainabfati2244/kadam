export type RootStackParamList = {
  Splash: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  OTP: { email: string };
  ResetPassword: { email: string; otp: string };
  MainTabs: undefined;
  AdminTabs: undefined;
  OrderDetail: { orderId: string };
  AddToCart: undefined;
  Checkout: undefined;
  Notifications: undefined;
  MyOrders: undefined;
  ShippingAddress: undefined;
  ProductDetail: {
    product: {
      id: string;
      name: string;
      price: number;
      tag?: string;
      tagColor?: string;
      image: string;
    };
  };
};

export type MainTabParamList = {
  Home: undefined;
  Favorite: undefined;
  Search: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Orders: undefined;
  Customers: undefined;
  Categories: undefined;
  Reviews: undefined;
};
