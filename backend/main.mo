import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import UserApproval "user-approval/approval";

import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";

import Migration "migration";

(with migration = Migration.run)
actor {
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

  public type MuseumLocation = {
    #equipePrincipal;
    #comunicacao;
    #administracao;
    #programacao;
    #producaoGeral;
    #coordenacao;
  };

  public type Month = {
    #february;
    #march;
    #april;
    #may;
    #june;
    #july;
    #august;
    #september;
    #october;
    #november;
  };

  public type Year = Nat;
  public type ReportId = Text;
  public type ActivityId = Text;
  public type Attachment = Storage.ExternalBlob;

  public type Status = {
    #draft;
    #submitted;
    #underReview;
    #approved;
    #analysis;
    #requiresAdjustment;
    #returned;
  };

  public type ReviewAction = {
    #approve;
    #returnReport;
  };

  public type ActivityStatus = {
    #notStarted;
    #submitted;
    #completed;
    #rescheduled;
    #cancelled;
  };

  public type Classification = {
    #goalLinked;
    #routine;
    #extra;
  };

  public type GoalStatus = {
    #inProgress;
    #partiallyCumplied;
    #achieved;
    #exceeded;
  };

  public type AccessibilityOption = {
    #none;
    #libras;
    #audioDescription;
    #tactileMaterial;
    #other;
  };

  public type EvidenceType = {
    #photos;
    #attendanceList;
    #report;
    #graphicMaterial;
    #other;
  };

  public type Date = Time.Time;

  public type AudienceBreakdown = {
    children : Nat;
    youth : Nat;
    adults : Nat;
    elderly : Nat;
    pcd : Nat;
  };

  public type ProductRealised = {
    #oficinaRealizada;
    #relatorioEntregue;
    #exposicaoMontada;
    #eventoExecutado;
    #planoDeAcaoElaborado;
    #materialGraficoProduzido;
    #conteudoDigitalPublicado;
    #pesquisaConcluida;
    #reuniaoRegistrada;
    #naoSeAplica;
    #outro;
  };

  public type Quantity = {
    #one;
    #two;
    #three;
    #four;
    #five;
    #six;
    #seven;
    #eight;
    #nine;
    #ten;
    #maisDeDez;
  };

  public type AudienceRange = {
    #zeroToTwenty;
    #twentyOneToFifty;
    #fiftyOneToHundred;
    #hundredOneToTwoHundred;
    #twoHundredOneToFiveHundred;
    #aboveFiveHundred;
    #naoSeAplica;
  };

  public type Report = {
    id : ReportId;
    protocolNumber : Text;
    referenceMonth : Month;
    year : Year;
    professionalName : Text;
    funcaoCargo : Text;
    role : Text;
    mainMuseum : MuseumLocation;
    workedAtOtherMuseum : Bool;
    otherMuseum : ?Text;
    executiveSummary : Text;
    positivePoints : Text;
    difficulties : Text;
    suggestions : Text;
    identifiedOpportunity : Text;
    opportunityCategory : Text;
    expectedImpact : Text;
    status : Status;
    sendDate : ?Time.Time;
    signature : ?Text;
    authorId : Principal;
    generalExecutiveSummary : ?Text;
    consolidatedGoals : ?Text;
    institutionalObservations : ?Text;
    submittedAt : ?Time.Time;
    approvedAt : ?Time.Time;
    coordinatorComments : ?Text;
    coordinatorSignature : ?Storage.ExternalBlob;
    reviewedBy : ?Principal;
    reviewTimestamp : ?Time.Time;
  };

  public type ReportCreate = {
    referenceMonth : Month;
    year : Year;
    professionalName : Text;
    funcaoCargo : Text;
    role : Text;
    mainMuseum : MuseumLocation;
    workedAtOtherMuseum : Bool;
    otherMuseum : ?Text;
    executiveSummary : Text;
    positivePoints : Text;
    difficulties : Text;
    suggestions : Text;
    identifiedOpportunity : Text;
    opportunityCategory : Text;
    expectedImpact : Text;
    status : Status;
    authorId : Principal;
  };

  public type FileEvidence = {
    fileId : Text;
    fileName : Text;
    fileType : Text;
    fileSize : Nat;
    uploaderId : Principal;
    uploaderName : Text;
    uploadedAt : Time.Time;
  };

  public type ProdutoRealizado = {
    #coberturaFotografica;
    #posts;
    #releases;
    #textoExpografico;
    #textoCatalogo;
    #designCatalogo;
    #coberturaDeVideo;
    #outros;
  };

  public type LocalRealizado = {
    #MHAB;
    #MUMO;
    #MIS;
    #Outro;
  };

  public type Activity = {
    id : ActivityId;
    reportId : ReportId;
    date : Date;
    startDate : Time.Time;
    endDate : Time.Time;
    startTime : Time.Time;
    endTime : Time.Time;
    museum : MuseumLocation;
    localRealizado : LocalRealizado;
    localOutroDescricao : Text;
    actionType : Text;
    activityName : Text;
    dedicatedHours : ?Nat;
    hoursNotApplicable : Bool;
    classification : Classification;
    goalNumber : ?Nat;
    goalDescription : ?Text;
    plannedIndicator : ?Text;
    quantitativeGoal : ?Int;
    achievedResult : ?Int;
    contributionPercent : ?Float;
    goalStatus : ?GoalStatus;
    technicalJustification : ?Text;
    totalAudience : Nat;
    children : Nat;
    youth : Nat;
    adults : Nat;
    elderly : Nat;
    pcd : Nat;
    accessibilityOptions : [AccessibilityOption];
    hadPartnership : Bool;
    partnerName : ?Text;
    partnerType : ?Text;
    objective : ?Text;
    executedDescription : Text;
    achievedResults : Text;
    qualitativeAssessment : Text;
    evidences : [EvidenceType];
    attachmentsPrefix : Text;
    productRealised : ProductRealised;
    quantity : ?Quantity;
    audienceRange : AudienceRange;
    partnershipsInvolved : ?Text;
    status : ActivityStatus;
    cancellationReason : ?Text;
    files : [Attachment];
    linkedActivityId : ?ActivityId;
    evidencias : [FileEvidence];
    produtosRealizados : [ProdutoRealizado];
  };

  public type ActivityCreate = {
    id : ActivityId;
    reportId : ReportId;
    date : Date;
    startDate : Time.Time;
    endDate : Time.Time;
    startTime : Time.Time;
    endTime : Time.Time;
    museum : MuseumLocation;
    localRealizado : LocalRealizado;
    localOutroDescricao : Text;
    actionType : Text;
    activityName : Text;
    dedicatedHours : ?Nat;
    hoursNotApplicable : Bool;
    classification : Classification;
    goalNumber : ?Nat;
    goalDescription : ?Text;
    plannedIndicator : ?Text;
    quantitativeGoal : ?Int;
    achievedResult : ?Int;
    contributionPercent : ?Float;
    goalStatus : ?GoalStatus;
    technicalJustification : ?Text;
    totalAudience : Nat;
    children : Nat;
    youth : Nat;
    adults : Nat;
    elderly : Nat;
    pcd : Nat;
    accessibilityOptions : [AccessibilityOption];
    hadPartnership : Bool;
    partnerName : ?Text;
    partnerType : ?Text;
    objective : ?Text;
    executedDescription : Text;
    achievedResults : Text;
    qualitativeAssessment : Text;
    evidences : [EvidenceType];
    attachmentsPrefix : Text;
    productRealised : ProductRealised;
    quantity : ?Quantity;
    audienceRange : AudienceRange;
    partnershipsInvolved : ?Text;
    status : ActivityStatus;
    cancellationReason : ?Text;
    files : [Attachment];
    linkedActivityId : ?ActivityId;
    evidencias : [FileEvidence];
    produtosRealizados : [ProdutoRealizado];
  };

  public type Museum = {
    id : Nat;
    name : Text;
    active : Bool;
  };

  public type Goal = {
    id : Nat;
    name : Text;
    description : ?Text;
    active : Bool;
  };

  public type StatusBreakdown = {
    draft : Nat;
    submitted : Nat;
    underReview : Nat;
    approved : Nat;
    analysis : Nat;
    requiresAdjustment : Nat;
  };

  public type CoordinationDashboard = {
    totalActivitiesPerMuseum : [(Text, Nat)];
    totalAudience : Nat;
    audienceByProfile : AudienceBreakdown;
    totalLinkedGoals : Nat;
    goalsAchieved : Nat;
    goalsInProgress : Nat;
    plannedActivitiesCount : Nat;
    extraActivitiesCount : Nat;
    activitiesWithAccessibility : Nat;
    partnershipsCount : Nat;
    monthlyEvolution : [(Text, Nat)];
    totalDedicatedHours : Nat;
    reportStatusBreakdown : StatusBreakdown;
    reportsByMuseum : [(Text, Nat)];
    reportsByMonth : [(Text, Nat)];
  };

  public type DashboardFilter = {
    museum : ?MuseumLocation;
    month : ?Text;
    professionalName : ?Text;
  };

  public type FullUserProfile = {
    principal : Principal;
    name : Text;
    appRole : AppUserRole;
    team : TeamLocation;
    approvalStatus : UserApproval.ApprovalStatus;
  };

  public type ProfessionalOption = {
    principal : Principal;
    name : Text;
  };

  public type ActivitySearchResult = {
    id : ActivityId;
    activityName : Text;
  };

  public type DateRange = {
    startMonth : Month;
    startYear : Year;
    endMonth : Month;
    endYear : Year;
  };

  public type AudienceQueryType = {
    #specificMonth : { month : Month; year : Year };
    #cumulativeTotal;
    #customRange : DateRange;
  };

  type ActivityValidationFields = {
    dedicatedHours : ?Nat;
    hoursNotApplicable : Bool;
    productRealised : ProductRealised;
    quantity : ?Quantity;
    audienceRange : AudienceRange;
    partnershipsInvolved : ?Text;
    status : ActivityStatus;
    cancellationReason : ?Text;
    totalAudience : Nat;
    children : Nat;
    youth : Nat;
    adults : Nat;
    elderly : Nat;
    pcd : Nat;
  };

  public type ReportActivityExport = {
    report : Report;
    activities : [Activity];
  };

  public type FileAttachment = {
    id : Text;
    name : Text;
    mimeType : Text;
    size : Nat;
    uploadedAt : Time.Time;
    uploader : Principal;
    base64Content : Text;
  };

  let fileAttachments = Map.empty<Text, FileAttachment>();
  let reportFileLinks = Map.empty<ReportId, [Text]>();
  let deletedUsers = Map.empty<Principal, ()>();

  let COORDINATION_RESERVED_NAME : Text = "Daniel Perini Santos";

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let approvalState = UserApproval.initState(accessControlState);

  let reports = Map.empty<ReportId, Report>();
  let activities = Map.empty<ActivityId, Activity>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let goals = Map.empty<Nat, Goal>();

  var protocolCounter = 0;
  var goalIdCounter = 0;

  func isAdminCaller(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  func isCoordinator(caller : Principal) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      return false;
    };
    switch (userProfiles.get(caller)) {
      case (?profile) {
        profile.appRole == #coordination or profile.appRole == #coordinator;
      };
      case (null) { false };
    };
  };

  func isCoordinationFullOrAdmin(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller) or isExclusiveCoordinator(caller);
  };

  func isExclusiveCoordinator(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        profile.appRole == #coordination and profile.name == COORDINATION_RESERVED_NAME;
      };
      case (null) { false };
    };
  };

  func isAppAdministration(caller : Principal) : Bool {
    if (isAdminCaller(caller)) { return true };
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      return false;
    };
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.appRole == #administration };
      case (null) { false };
    };
  };

  func canRead(caller : Principal, ownerPrincipal : Principal) : Bool {
    if (caller == ownerPrincipal) { return true };
    isCoordinator(caller);
  };

  func activityOwner(activityId : ActivityId) : ?Principal {
    switch (activities.get(activityId)) {
      case (?activity) {
        switch (reports.get(activity.reportId)) {
          case (?report) { ?report.authorId };
          case (null) { null };
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    switch (deletedUsers.get(caller)) {
      case (?_) { null };
      case (null) {
        if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
          Runtime.trap("Unauthorized: Only registered users can get profile");
        };
        userProfiles.get(caller);
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    switch (deletedUsers.get(user)) {
      case (?_) { null };
      case (null) {
        if (caller != user and not isCoordinator(caller)) {
          Runtime.trap("Unauthorized: Can only view own profile");
        };
        userProfiles.get(user);
      };
    };
  };

  public query ({ caller }) func listRegisteredProfessionals() : async [ProfessionalOption] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view professionals");
    };
    let professionalOptions = userProfiles.toArray().map(func((p, profile)) {
      {
        principal = p;
        name = profile.name;
      }
    });
    professionalOptions.filter(
      func(option) {
        switch (deletedUsers.get(option.principal)) {
          case (?_) { false };
          case (null) { true };
        };
      }
    );
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can save profile");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func listAllUserProfiles() : async [FullUserProfile] {
    if (not isCoordinator(caller)) {
      Runtime.trap("Unauthorized: Only Coordinator/Admin can view all user profiles");
    };
    let fullProfiles = userProfiles.toArray().map(func((p, profile)) {
      {
        principal = p;
        name = profile.name;
        appRole = profile.appRole;
        team = profile.team;
        approvalStatus = switch (UserApproval.isApproved(approvalState, p)) {
          case (true) { #approved };
          case (false) {
            let approvals = UserApproval.listApprovals(approvalState);
            switch (approvals.find(func(a) { a.principal == p })) {
              case (?info) { info.status };
              case (null) { #pending };
            };
          };
        };
      };
    });
    fullProfiles.filter(
      func(profile) {
        switch (deletedUsers.get(profile.principal)) {
          case (?_) { false };
          case (null) { true };
        };
      }
    );
  };

  public shared ({ caller }) func updateUserProfile(user : Principal, updatedProfile : UserProfile) : async () {
    if (not isExclusiveCoordinator(caller) and not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only Coordination (Coordenador Geral) or Admin can update user profiles");
    };
    switch (userProfiles.get(user)) {
      case (?_existing) { userProfiles.add(user, updatedProfile) };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func updateUserRole(user : Principal, newRole : AppUserRole) : async () {
    if (not isExclusiveCoordinator(caller) and not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only Coordination (Coordenador Geral) or Admin can update user roles");
    };
    switch (userProfiles.get(user)) {
      case (?profile) {
        let updatedProfile : UserProfile = { profile with appRole = newRole };
        userProfiles.add(user, updatedProfile);
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func deleteUserProfile(user : Principal) : async () {
    if (not isExclusiveCoordinator(caller) and not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only Coordination (Coordenador Geral) or Admin can delete users");
    };
    switch (deletedUsers.get(user)) {
      case (?_) { Runtime.trap("User already deleted") };
      case (null) {
        userProfiles.remove(user);
        deletedUsers.add(user, ());
      };
    };
  };

  public query ({ caller }) func isCallerApproved() : async Bool {
    if (AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return true;
    };
    if (isCoordinator(caller)) {
      return true;
    };
    UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  public shared ({ caller }) func approveUser(user : Principal) : async () {
    if (not isExclusiveCoordinator(caller) and not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only Coordination (Coordenador Geral) or Admin can approve users");
    };
    UserApproval.setApproval(approvalState, user, #approved);
  };

  public shared ({ caller }) func rejectUser(user : Principal) : async () {
    if (not isExclusiveCoordinator(caller) and not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only Coordination (Coordenador Geral) or Admin can reject users");
    };
    UserApproval.setApproval(approvalState, user, #rejected);
  };

  public shared ({ caller }) func reviewReport(reportId : ReportId, action : ReviewAction, comment : ?Text) : async () {
    if (not isCoordinator(caller) and not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only Coordination or Admin can review reports");
    };

    switch (reports.get(reportId)) {
      case (null) {
        Runtime.trap("Report not found: " # reportId);
      };

      case (?report) {
        let updatedReport : Report = {
          report with
          status = switch action {
            case (#approve) { #approved };
            case (#returnReport) { #returned };
          };
          coordinatorComments = comment;
          reviewedBy = ?caller;
          reviewTimestamp = ?Time.now();
        };
        reports.add(reportId, updatedReport);
      };
    };
  };
};
