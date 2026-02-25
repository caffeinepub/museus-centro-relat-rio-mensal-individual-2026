// <COMPONENT>
/// This file imports "administrative" components:
/// * Authorization
/// * External blob storage

import Array "mo:core/Array";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import UserApproval "user-approval/approval";

// <COMPONENT>

actor {
  // ── Types ──────────────────────────────────────────────────────────────────

  public type AppUserRole = {
    #professional;
    #coordination;
    #administration;
  };

  public type UserProfile = {
    name : Text;
    appRole : AppUserRole;
    museum : MuseumLocation;
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
  };

  public type Activity = {
    id : ActivityId;
    reportId : ReportId;
    date : Date;
    museum : MuseumLocation;
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
    museum : MuseumLocation;
    approvalStatus : UserApproval.ApprovalStatus;
  };

  // ── Constants ──────────────────────────────────────────────────────────────

  /// The only name allowed to hold the #coordination role.
  let COORDINATION_RESERVED_NAME : Text = "Daniel Perini Santos";

  // ── State ──────────────────────────────────────────────────────────────────

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

  // ── Role helpers ───────────────────────────────────────────────────────────

  /// Enforce that the #coordination role may only be assigned to a profile
  /// whose name is exactly COORDINATION_RESERVED_NAME.
  /// If the requested role is #coordination and the name does not match,
  /// the role is silently downgraded to #professional.
  func enforceCoordinationRestriction(name : Text, requestedRole : AppUserRole) : AppUserRole {
    switch (requestedRole) {
      case (#coordination) {
        if (name == COORDINATION_RESERVED_NAME) {
          #coordination;
        } else {
          #professional;
        };
      };
      case (other) { other };
    };
  };

  module Report {
    public func compareByMonthAndStatus(a : Report, b : Report) : Order.Order {
      switch (Nat.compare(a.year, b.year)) {
        case (#equal) {
          switch (compareMonthOrder(a.referenceMonth, b.referenceMonth)) {
            case (#equal) { compareStatusOrder(a.status, b.status) };
            case (other) { other };
          };
        };
        case (other) { other };
      };
    };

    func compareMonthOrder(a : Month, b : Month) : Order.Order {
      let monthOrder : [Month] = [
        #february,
        #march,
        #april,
        #may,
        #june,
        #july,
        #august,
        #september,
        #october,
        #november,
      ];
      let aIndex = monthOrder.findIndex(func(m : Month) : Bool { m == a });
      let bIndex = monthOrder.findIndex(func(m : Month) : Bool { m == b });
      switch (aIndex, bIndex) {
        case (?ai, ?bi) {
          if (ai < bi) { #less } else if (ai > bi) { #greater } else { #equal };
        };
        case (null, _) { #less };
        case (_, null) { #greater };
      };
    };

    func compareStatusOrder(a : Status, b : Status) : Order.Order {
      let statusOrder : [Status] = [#draft, #submitted, #underReview, #approved, #analysis, #requiresAdjustment];
      let aIndex = statusOrder.findIndex(func(s : Status) : Bool { s == a });
      let bIndex = statusOrder.findIndex(func(s : Status) : Bool { s == b });
      switch (aIndex, bIndex) {
        case (?ai, ?bi) {
          if (ai < bi) { #less } else if (ai > bi) { #greater } else { #equal };
        };
        case (null, _) { #less };
        case (_, null) { #greater };
      };
    };
  };

  module Activity {
    public func compareByDate(a : Activity, b : Activity) : Order.Order {
      compareDateOrder(a.date, b.date);
    };

    func compareDateOrder(a : Date, b : Date) : Order.Order {
      if (a < b) { #less } else if (a > b) { #greater } else { #equal };
    };
  };

  func isAdminCaller(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  func isCoordination(caller : Principal) : Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      return false;
    };
    switch (userProfiles.get(caller)) {
      case (?profile) {
        // Double-check: coordination role is only valid when the name matches
        profile.appRole == #coordination and profile.name == COORDINATION_RESERVED_NAME
      };
      case (null) { false };
    };
  };

  func isCoordinationOrAdmin(caller : Principal) : Bool {
    isAdminCaller(caller) or isCoordination(caller)
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
    isCoordinationOrAdmin(caller);
  };

  func canWrite(caller : Principal, ownerPrincipal : Principal) : Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      return false;
    };
    caller == ownerPrincipal;
  };

  // ── User profile endpoints (required by frontend) ──────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can get profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isCoordinationOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view own profile");
    };
    userProfiles.get(user);
  };

  /// Save the caller's own profile.
  /// The #coordination role is only permitted when the profile name is
  /// exactly COORDINATION_RESERVED_NAME; otherwise it is downgraded to
  /// #professional.
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can save profile");
    };
    let safeRole = enforceCoordinationRestriction(profile.name, profile.appRole);
    let safeProfile : UserProfile = { profile with appRole = safeRole };
    userProfiles.add(caller, safeProfile);
  };

  public query ({ caller }) func listAllUserProfiles() : async [FullUserProfile] {
    if (not isCoordinationOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Coordination/Admin can view all user profiles");
    };

    let fullProfiles = userProfiles.toArray().map(func((p, profile)) {
      {
        principal = p;
        name = profile.name;
        appRole = profile.appRole;
        museum = profile.museum;
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

    fullProfiles;
  };

  /// Update any user's profile fields (name, role, museum).
  /// Callable by coordinator or admin.
  /// The #coordination role is only permitted when the target profile name is
  /// exactly COORDINATION_RESERVED_NAME; otherwise it is downgraded to
  /// #professional.
  public shared ({ caller }) func updateUserProfile(user : Principal, updatedProfile : UserProfile) : async () {
    if (not isCoordinationOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Coordination/Admin can update user profiles");
    };
    switch (userProfiles.get(user)) {
      case (?_existing) {
        let safeRole = enforceCoordinationRestriction(updatedProfile.name, updatedProfile.appRole);
        let safeProfile : UserProfile = { updatedProfile with appRole = safeRole };
        userProfiles.add(user, safeProfile);
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  /// Update only the role of a user.
  /// Callable by coordinator or admin.
  /// The #coordination role is only permitted when the target user's registered
  /// name is exactly COORDINATION_RESERVED_NAME; otherwise it is downgraded to
  /// #professional.
  public shared ({ caller }) func updateUserRole(user : Principal, newRole : AppUserRole) : async () {
    if (not isCoordinationOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Coordination/Admin can update user roles");
    };

    switch (userProfiles.get(user)) {
      case (?profile) {
        let safeRole = enforceCoordinationRestriction(profile.name, newRole);
        let updatedProfile : UserProfile = { profile with appRole = safeRole };
        userProfiles.add(user, updatedProfile);
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  /// Delete any user profile.
  /// Callable by coordinator or admin.
  public shared ({ caller }) func deleteUserProfile(user : Principal) : async () {
    if (not isCoordinationOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Coordination/Admin can delete users");
    };
    userProfiles.remove(user);
  };

  // ── User Approval Endpoints ────────────────────────────────────────────────

  /// Returns true for admins, coordinators (Daniel Perini Santos), and
  /// explicitly approved users — no approval gate for the coordinator.
  public query ({ caller }) func isCallerApproved() : async Bool {
    if (AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return true;
    };
    if (isCoordination(caller)) {
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
    if (not (isCoordinationOrAdmin(caller))) {
      Runtime.trap("Unauthorized: Only Coordination/Admin can perform this action");
    };
    UserApproval.setApproval(approvalState, user, #approved);
  };

  // ── Report endpoints ───────────────────────────────────────────────────────

  public shared ({ caller }) func createReport(report : Report) : async ReportId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can create reports");
    };
    if (report.authorId != caller) {
      Runtime.trap("Unauthorized: Can only create own reports");
    };
    validateReport(report);

    let reportId = generateId();

    protocolCounter += 1;
    let protocolNumber = "PROTO-" # Time.now().toText() # "-" # protocolCounter.toText();

    let newReport : Report = {
      report with
      id = reportId;
      protocolNumber;
      sendDate = null;
      signature = null;
      generalExecutiveSummary = null;
      consolidatedGoals = null;
      institutionalObservations = null;
      submittedAt = null;
      approvedAt = null;
      coordinatorComments = null;
      coordinatorSignature = null;
    };
    reports.add(reportId, newReport);
    reportId;
  };

  public shared ({ caller }) func updateReport(reportId : ReportId, updated : Report) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can update reports");
    };
    let existing = switch (reports.get(reportId)) {
      case (?r) { r };
      case (null) { Runtime.trap("Report not found") };
    };
    if (not canWrite(caller, existing.authorId)) {
      Runtime.trap("Unauthorized: Can only edit own reports");
    };
    validateReport(updated);
    let updatedReport : Report = {
      updated with
      id = reportId;
      authorId = existing.authorId;
      protocolNumber = existing.protocolNumber;
      submittedAt = existing.submittedAt;
      approvedAt = existing.approvedAt;
      coordinatorComments = existing.coordinatorComments;
      coordinatorSignature = existing.coordinatorSignature;
    };
    reports.add(reportId, updatedReport);
  };

  public query ({ caller }) func getReport(reportId : ReportId) : async Report {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view reports");
    };
    let report = switch (reports.get(reportId)) {
      case (?r) { r };
      case (null) { Runtime.trap("Report not found") };
    };
    if (not canRead(caller, report.authorId)) {
      Runtime.trap("Unauthorized: Can only view own reports");
    };
    report;
  };

  public query ({ caller }) func getReportsForUser(userId : Principal) : async [Report] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view reports");
    };
    if (not canRead(caller, userId)) {
      Runtime.trap("Unauthorized: Professionals can only view own reports");
    };
    let userReports = reports.values().toArray().filter(
      func(r : Report) : Bool { r.authorId == userId }
    );
    userReports.sort(Report.compareByMonthAndStatus);
  };

  public query ({ caller }) func getAllReports() : async [Report] {
    if (not isCoordinationOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Coordination/Admin can view all reports");
    };
    reports.values().toArray().sort(Report.compareByMonthAndStatus);
  };

  public shared ({ caller }) func submitReport(reportId : ReportId) : async () {
    let existing = switch (reports.get(reportId)) {
      case (?r) { r };
      case (null) { Runtime.trap("Report not found") };
    };
    if (not canWrite(caller, existing.authorId)) {
      Runtime.trap("Unauthorized: Can only submit own reports");
    };
    let now = Time.now();
    let updated : Report = {
      existing with
      status = #submitted;
      sendDate = ?now;
      submittedAt = ?now;
    };
    reports.add(reportId, updated);
  };

  // ── Coordination-only Review Workflow ──────────────────────────────────────

  public shared ({ caller }) func reviewReport(
    reportId : ReportId,
    newStatus : Status,
    comments : ?Text,
    signature : ?Storage.ExternalBlob,
  ) : async () {
    if (not isCoordinationOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Coordination/Admin can review reports");
    };

    if (newStatus != #underReview and newStatus != #approved) {
      Runtime.trap("Invalid status transition. Only 'UnderReview' or 'Approved' allowed.");
    };

    let existing = switch (reports.get(reportId)) {
      case (?r) { r };
      case (null) { Runtime.trap("Report not found") };
    };

    let updated : Report = {
      existing with
      status = newStatus;
      coordinatorComments = comments;
      coordinatorSignature = signature;
      approvedAt = if (newStatus == #approved) { ?Time.now() } else { existing.approvedAt };
    };

    reports.add(reportId, updated);
  };

  public shared ({ caller }) func uploadSignature(reportId : ReportId, signatureBase64 : Text) : async () {
    let existing = switch (reports.get(reportId)) {
      case (?r) { r };
      case (null) { Runtime.trap("Report not found") };
    };
    if (not canWrite(caller, existing.authorId)) {
      Runtime.trap("Unauthorized: Can only upload signature for own report");
    };
    let updated : Report = { existing with signature = ?signatureBase64 };
    reports.add(reportId, updated);
  };

  // ── Coordination fields endpoints ──────────────────────────────────────────

  public shared ({ caller }) func updateCoordinationFields(
    reportId : ReportId,
    executiveSummary : Text,
    consolidatedGoals : Text,
    institutionalObservations : Text,
  ) : async () {
    if (not isCoordinationOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Coordination/Admin can update coordination fields");
    };
    let existing = switch (reports.get(reportId)) {
      case (?r) { r };
      case (null) { Runtime.trap("Report not found") };
    };
    let updated : Report = {
      existing with
      generalExecutiveSummary = ?executiveSummary;
      consolidatedGoals = ?consolidatedGoals;
      institutionalObservations = ?institutionalObservations;
    };
    reports.add(reportId, updated);
  };

  // ── Activity endpoints ─────────────────────────────────────────────────────

  public shared ({ caller }) func createActivity(activity : Activity) : async ActivityId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can create activities");
    };
    let reportAuthor = getReportAuthorId(activity.reportId);
    if (not canWrite(caller, reportAuthor)) {
      Runtime.trap("Unauthorized: Can only create activities for own reports");
    };
    validateActivity(activity);
    let activityId = generateId();
    let newActivity : Activity = { activity with id = activityId };
    activities.add(activityId, newActivity);
    activityId;
  };

  public shared ({ caller }) func updateActivity(activityId : ActivityId, updated : Activity) : async () {
    let existing = switch (activities.get(activityId)) {
      case (?a) { a };
      case (null) { Runtime.trap("Activity not found") };
    };
    let reportAuthor = getReportAuthorId(existing.reportId);
    if (not canWrite(caller, reportAuthor)) {
      Runtime.trap("Unauthorized: Can only edit activities in own reports");
    };
    validateActivity(updated);
    let updatedActivity : Activity = { updated with id = activityId };
    activities.add(activityId, updatedActivity);
  };

  public query ({ caller }) func getActivity(activityId : ActivityId) : async Activity {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view activities");
    };
    let activity = switch (activities.get(activityId)) {
      case (?a) { a };
      case (null) { Runtime.trap("Activity not found") };
    };
    let reportAuthor = getReportAuthorId(activity.reportId);
    if (not canRead(caller, reportAuthor)) {
      Runtime.trap("Unauthorized: Can only view activities in own reports");
    };
    activity;
  };

  public query ({ caller }) func getActivitiesForReport(reportId : ReportId) : async [Activity] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view activities");
    };
    let reportAuthor = getReportAuthorId(reportId);
    if (not canRead(caller, reportAuthor)) {
      Runtime.trap("Unauthorized: Can only view activities in own reports");
    };
    activities.values().toArray().filter(
      func(a : Activity) : Bool { a.reportId == reportId }
    );
  };

  public query ({ caller }) func getAllActivities() : async [Activity] {
    if (not isCoordinationOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Coordination/Admin can view all activities");
    };
    activities.values().toArray();
  };

  // ── Goals Management ─────────────────────────────────────────────
  public shared ({ caller }) func addGoal(name : Text, description : ?Text) : async () {
    if (not isAppAdministration(caller)) {
      Runtime.trap("Unauthorized: Only Administration can add goals");
    };
    goalIdCounter += 1;
    let newId = goalIdCounter;
    goals.add(
      newId,
      {
        id = newId;
        name;
        description;
        active = true;
      },
    );
  };

  public shared ({ caller }) func toggleGoalActive(goalId : Nat) : async () {
    if (not isAppAdministration(caller)) {
      Runtime.trap("Unauthorized: Only Administration can toggle goals");
    };
    let goal = switch (goals.get(goalId)) {
      case (?g) { g };
      case (null) { Runtime.trap("Goal not found") };
    };
    goals.add(goalId, { goal with active = not goal.active });
  };

  public query func listGoals() : async [Goal] {
    goals.values().toArray().filter(func(g : Goal) : Bool { g.active });
  };

  // ── Coordination Dashboard endpoint with filters ───────────────────────────

  public query ({ caller }) func getCoordinationDashboardWithFilter(filter : DashboardFilter) : async CoordinationDashboard {
    if (not isCoordinationOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only Coordination/Admin can view dashboard indicators");
    };

    let filteredReports = reports.values().toArray().filter(
      func(r : Report) : Bool {
        isNullMuseum(filter.museum, r.mainMuseum) and
        isNullText(filter.month, monthLabelFromMonth(r.referenceMonth)) and
        isNullText(filter.professionalName, r.professionalName);
      }
    );

    let filteredActivities = activities.values().toArray().filter(
      func(a : Activity) : Bool {
        isNullMuseum(filter.museum, a.museum) and
        isNullText(filter.month, monthLabelFromTime(a.date)) and
        isNullText(filter.professionalName, getProfessionalNameByReportId(a.reportId));
      }
    );

    {
      totalActivitiesPerMuseum = buildTotalActivitiesPerMuseum(filteredActivities);
      totalAudience = calculateTotalAudience(filteredActivities);
      audienceByProfile = calculateAudienceByProfile(filteredActivities);
      totalLinkedGoals = calculateTotalLinkedGoals(filteredActivities);
      goalsAchieved = calculateGoalsAchieved(filteredActivities);
      goalsInProgress = calculateGoalsInProgress(filteredActivities);
      plannedActivitiesCount = calculatePlannedActivitiesCount(filteredActivities);
      extraActivitiesCount = calculateExtraActivitiesCount(filteredActivities);
      activitiesWithAccessibility = calculateActivitiesWithAccessibility(filteredActivities);
      partnershipsCount = calculatePartnershipsCount(filteredActivities);
      monthlyEvolution = buildMonthlyEvolution(filteredActivities);
      totalDedicatedHours = calculateTotalDedicatedHours(filteredActivities);
      reportStatusBreakdown = buildStatusBreakdown(filteredReports);
      reportsByMuseum = buildReportsByMuseum(filteredReports);
      reportsByMonth = buildReportsByMonth(filteredReports);
    };
  };

  // ── Private helpers ────────────────────────────────────────────────────────

  func generateId() : Text {
    let ts = Time.now();
    ts.toText();
  };

  func validateReport(_report : Report) { () };

  func validateActivity(activity : Activity) {
    validateAudience(activity);

    if ((activity.dedicatedHours == null) == not activity.hoursNotApplicable) {
      Runtime.trap("Either dedicatedHours or hoursNotApplicable must be set, but not both");
    };

    if (activity.productRealised != #naoSeAplica and activity.quantity == null) {
      Runtime.trap("Quantity is required when ProductRealised is not 'Não se aplica'");
    };

    switch (activity.audienceRange) {
      case (#hundredOneToTwoHundred or #twoHundredOneToFiveHundred or #aboveFiveHundred) {
        if (activity.partnershipsInvolved == null) {
          Runtime.trap("Partnerships involved is required for audience range above 100");
        };
      };
      case (_) {};
    };

    if (activity.status == #cancelled and activity.cancellationReason == null) {
      Runtime.trap("Cancellation reason is required for cancelled activities");
    };
  };

  func validateAudience(activity : Activity) {
    let totalSubGroups =
      activity.children +
      activity.youth +
      activity.adults +
      activity.elderly +
      activity.pcd;
    if (totalSubGroups > activity.totalAudience) {
      Runtime.trap("Sum of children, youth, adults, elderly, and PCD cannot exceed total audience");
    };
  };

  func getReportAuthorId(reportId : ReportId) : Principal {
    switch (reports.get(reportId)) {
      case (?report) { report.authorId };
      case (null) { Runtime.trap("Report not found") };
    };
  };

  func monthLabelFromTime(t : Time.Time) : Text {
    let seconds : Int = t / 1_000_000_000;
    let days : Int = seconds / 86400;
    let z : Int = days + 719468;
    let era : Int = (if (z >= 0) { z } else { z - 146096 }) / 146097;
    let doe : Int = z - era * 146097;
    let yoe : Int = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y : Int = yoe + era * 400;
    let doy : Int = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp : Int = (5 * doy + 2) / 153;
    let m : Int = mp + (if (mp < 10) { 3 } else { -9 });
    let year : Int = y + (if (m <= 2) { 1 } else { 0 });
    let month : Int = m;
    let monthStr = if (month < 10) { "0" # month.toText() } else { month.toText() };
    year.toText() # "-" # monthStr;
  };

  func monthLabelFromMonth(m : Month) : Text {
    switch (m) {
      case (#february) { "february" };
      case (#march) { "march" };
      case (#april) { "april" };
      case (#may) { "may" };
      case (#june) { "june" };
      case (#july) { "july" };
      case (#august) { "august" };
      case (#september) { "september" };
      case (#october) { "october" };
      case (#november) { "november" };
    };
  };

  func calculateTotalAudience(acts : [Activity]) : Nat {
    acts.foldLeft(0, func(acc, a) { acc + a.totalAudience });
  };

  func calculateAudienceByProfile(acts : [Activity]) : AudienceBreakdown {
    var totalChildren = 0;
    var totalYouth = 0;
    var totalAdults = 0;
    var totalElderly = 0;
    var totalPcd = 0;

    for (a in acts.vals()) {
      totalChildren += a.children;
      totalYouth += a.youth;
      totalAdults += a.adults;
      totalElderly += a.elderly;
      totalPcd += a.pcd;
    };
    {
      children = totalChildren;
      youth = totalYouth;
      adults = totalAdults;
      elderly = totalElderly;
      pcd = totalPcd;
    };
  };

  func calculateTotalLinkedGoals(acts : [Activity]) : Nat {
    var count = 0;
    for (a in acts.vals()) {
      if (a.classification == #goalLinked) { count += 1 };
    };
    count;
  };

  func calculateGoalsAchieved(acts : [Activity]) : Nat {
    var count = 0;
    for (a in acts.vals()) {
      if (a.classification == #goalLinked) {
        switch (a.goalStatus) {
          case (? #achieved) { count += 1 };
          case (? #exceeded) { count += 1 };
          case (_) {};
        };
      };
    };
    count;
  };

  func calculateGoalsInProgress(acts : [Activity]) : Nat {
    var count = 0;
    for (a in acts.vals()) {
      if (a.classification == #goalLinked) {
        switch (a.goalStatus) {
          case (? #inProgress) { count += 1 };
          case (? #partiallyCumplied) { count += 1 };
          case (_) {};
        };
      };
    };
    count;
  };

  func calculatePlannedActivitiesCount(acts : [Activity]) : Nat {
    acts.foldLeft(
      0,
      func(acc, a) {
        switch (a.classification) {
          case (#routine or #goalLinked) { acc + 1 };
          case (_) { acc };
        };
      },
    );
  };

  func calculateExtraActivitiesCount(acts : [Activity]) : Nat {
    acts.foldLeft(
      0,
      func(acc, a) {
        if (a.classification == #extra) { acc + 1 } else { acc };
      },
    );
  };

  func calculateActivitiesWithAccessibility(acts : [Activity]) : Nat {
    acts.foldLeft(
      0,
      func(acc, a) {
        let hasAccessibility = a.accessibilityOptions.size() > 0
          and not (a.accessibilityOptions.size() == 1 and a.accessibilityOptions[0] == #none);
        if (hasAccessibility) { acc + 1 } else { acc };
      },
    );
  };

  func calculatePartnershipsCount(acts : [Activity]) : Nat {
    acts.foldLeft(
      0,
      func(acc, a) { if (a.hadPartnership) { acc + 1 } else { acc } },
    );
  };

  func buildMonthlyEvolution(acts : [Activity]) : [(Text, Nat)] {
    let monthlyMap = Map.empty<Text, Nat>();

    for (a in acts.vals()) {
      let monthLabel = monthLabelFromTime(a.date);
      let currentMonthAudience = switch (monthlyMap.get(monthLabel)) {
        case (?n) { n };
        case (null) { 0 };
      };
      monthlyMap.add(monthLabel, currentMonthAudience + a.totalAudience);
    };

    monthlyMap.entries().toArray();
  };

  func calculateTotalDedicatedHours(acts : [Activity]) : Nat {
    acts.foldLeft(
      0,
      func(acc, a) {
        switch (a.dedicatedHours, a.hoursNotApplicable) {
          case (?hours, false) { acc + hours };
          case (_, true) { acc };
          case (null, false) { acc };
        };
      },
    );
  };

  func buildTotalActivitiesPerMuseum(acts : [Activity]) : [(Text, Nat)] {
    let museumMap = Map.empty<Text, Nat>();
    for (a in acts.vals()) {
      let current = switch (museumMap.get(formatMuseumName(a.museum))) {
        case (?n) { n };
        case (null) { 0 };
      };
      museumMap.add(
        formatMuseumName(a.museum),
        current + 1,
      );
    };
    museumMap.entries().toArray();
  };

  func buildStatusBreakdown(reps : [Report]) : StatusBreakdown {
    var draft = 0;
    var submitted = 0;
    var underReview = 0;
    var approved = 0;
    var analysis = 0;
    var requiresAdjustment = 0;

    for (r in reps.vals()) {
      switch (r.status) {
        case (#draft) { draft += 1 };
        case (#submitted) { submitted += 1 };
        case (#underReview) { underReview += 1 };
        case (#approved) { approved += 1 };
        case (#analysis) { analysis += 1 };
        case (#requiresAdjustment) { requiresAdjustment += 1 };
      };
    };

    {
      draft;
      submitted;
      underReview;
      approved;
      analysis;
      requiresAdjustment;
    };
  };

  func buildReportsByMuseum(reps : [Report]) : [(Text, Nat)] {
    let museumMap = Map.empty<Text, Nat>();
    for (r in reps.vals()) {
      let current = switch (museumMap.get(formatMuseumName(r.mainMuseum))) {
        case (?n) { n };
        case (null) { 0 };
      };
      museumMap.add(formatMuseumName(r.mainMuseum), current + 1);
    };
    museumMap.entries().toArray();
  };

  func buildReportsByMonth(reps : [Report]) : [(Text, Nat)] {
    let monthMap = Map.empty<Text, Nat>();
    for (r in reps.vals()) {
      let monthStr = monthLabelFromMonth(r.referenceMonth);
      let current = switch (monthMap.get(monthStr)) {
        case (?n) { n };
        case (null) { 0 };
      };
      monthMap.add(monthStr, current + 1);
    };
    monthMap.entries().toArray();
  };

  func getProfessionalNameByReportId(reportId : ReportId) : Text {
    switch (reports.get(reportId)) {
      case (?r) { r.professionalName };
      case (null) { "" };
    };
  };

  func isNullText(maybeText : ?Text, text : Text) : Bool {
    switch (maybeText) {
      case (null) { true };
      case (?v) { v == text };
    };
  };

  func isNullMuseum(maybeMuseum : ?MuseumLocation, museum : MuseumLocation) : Bool {
    switch (maybeMuseum) {
      case (null) { true };
      case (?v) { v == museum };
    };
  };

  func formatMuseumName(museum : MuseumLocation) : Text {
    switch (museum) {
      case (#equipePrincipal) { "Equipe Principal" };
      case (#comunicacao) { "Comunicação" };
      case (#administracao) { "Administração" };
      case (#programacao) { "Programação" };
      case (#producaoGeral) { "Produção Geral" };
      case (#coordenacao) { "Coordenação" };
    };
  };
};
