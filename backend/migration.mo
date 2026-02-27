import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  type OldUserProfile = {
    name : Text;
    appRole : {
      #professional;
      #coordination;
      #coordinator;
      #administration;
      #generalCoordinator;
    };
    team : { #mhab; #mumo; #mis; #comunicacao; #administracao; #empty };
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewUserProfile = {
    name : Text;
    appRole : { #professional; #coordination; #coordinator; #administration };
    team : { #mhab; #mumo; #mis; #comunicacao; #administracao; #empty };
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  func oldRoleToNew(oldRole : { #professional; #coordination; #coordinator; #administration; #generalCoordinator }) : { #professional; #coordination; #coordinator; #administration } {
    switch (oldRole) {
      case (#professional) { #professional };
      case (#coordination) { #coordination };
      case (#coordinator) { #coordinator };
      case (#administration) { #administration };
      case (#generalCoordinator) { #coordinator };
    };
  };

  public func run(old : OldActor) : NewActor {
    let newProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        {
          name = oldProfile.name;
          appRole = oldRoleToNew(oldProfile.appRole);
          team = oldProfile.team;
        };
      }
    );
    { userProfiles = newProfiles };
  };
};
