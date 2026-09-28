export interface Profile {
  profile: string;
  libelleProfile: string;
  habilitations: Array<any>;
}

export interface ProfileInterface {
  profile: Profile;
}

export interface ProfileData {
  data: ProfileInterface;
}
