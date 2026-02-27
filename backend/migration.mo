import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  public type AppUserRole = {
    #professional;
    #coordination;
    #coordinator;
    #administration;
  };

  public type TeamLocation = {
    #mhab;
    #mumo;
    #mis;
    #comunicacao;
    #administracao;
    #empty;
  };

  public type UserProfile = {
    name : Text;
    appRole : AppUserRole;
    team : TeamLocation;
  };

  // The privileged email addresses that must receive the #coordination role.
  let privilegedEmails : [Text] = [
    "daniel@periniprojetos.com.br",
    "danielperini.mc@viadutodasartes.org.br",
  ];

  func isPrivilegedEmail(email : Text) : Bool {
    for (e in privilegedEmails.vals()) {
      if (e == email) { return true };
    };
    false;
  };

  type Actor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    userEmails   : Map.Map<Principal, Text>;
  };

  public func run(old : Actor) : Actor {
    // Build a set of principals whose registered email is privileged.
    // We iterate over userEmails to find matching principals, then update
    // their userProfile to carry the #coordination role.
    let updatedProfiles = old.userProfiles.map<Principal, UserProfile, UserProfile>(
      func(principal, profile) {
        // Look up the email registered for this principal.
        switch (old.userEmails.get(principal)) {
          case (?email) {
            if (isPrivilegedEmail(email)) {
              // Assign the highest application role while preserving all
              // other profile fields.
              { profile with appRole = #coordination };
            } else {
              profile;
            };
          };
          case (null) {
            // No email on record – leave the profile unchanged.
            profile;
          };
        };
      }
    );
    { old with userProfiles = updatedProfiles };
  };
};
