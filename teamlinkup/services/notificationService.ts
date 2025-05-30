
import { ConfirmedMatch, MatchOffer } from '../types';

// In a real app, this would use an email service like SendGrid, Mailgun, etc.
// And Firebase Functions would trigger these.

export const sendMatchConfirmationEmail = (
  recipientEmail: string,
  matchDetails: ConfirmedMatch,
  isProposer: boolean
): void => {
  const opponentTeamName = isProposer ? matchDetails.acceptingTeamName : matchDetails.proposingTeamName;
  const opponentEmail = isProposer ? matchDetails.acceptingInscriberEmail : matchDetails.proposingInscriberEmail;
  
  const subject = "Match Confirmed!";
  const body = `
    Hi there,

    Your match has been confirmed!

    Details:
    Sport: ${matchDetails.sport}
    Skill Level: ${matchDetails.skillLevel}
    Date & Time: ${new Date(matchDetails.matchDateTime).toLocaleString()}
    Venue: ${matchDetails.venueName} (${matchDetails.venueAddress})
    Opponent Team: ${opponentTeamName}
    Opponent Contact: ${opponentEmail}

    Please ensure you arrive on time. Good luck!

    Regards,
    TeamLinkup
  `;
  console.log(`Simulating Email to: ${recipientEmail}\nSubject: ${subject}\nBody: ${body}`);
  alert(`Mock Email Sent to ${recipientEmail}:\nSubject: ${subject}\n\nMatch confirmed with ${opponentTeamName}. Check console for details.`);
};

export const sendMatchReminderEmail = (
  recipientEmail: string,
  matchDetails: ConfirmedMatch
): void => {
  const subject = "Match Reminder!";
  const body = `
    Hi there,

    This is a reminder for your upcoming match:

    Details:
    Sport: ${matchDetails.sport}
    Skill Level: ${matchDetails.skillLevel}
    Date & Time: ${new Date(matchDetails.matchDateTime).toLocaleString()}
    Venue: ${matchDetails.venueName} (${matchDetails.venueAddress})
    Opponent Team: ${matchDetails.proposingInscriberEmail === recipientEmail ? matchDetails.acceptingTeamName : matchDetails.proposingTeamName}
    Opponent Contact: ${matchDetails.proposingInscriberEmail === recipientEmail ? matchDetails.acceptingInscriberEmail : matchDetails.proposingInscriberEmail}

    See you on the field/court!

    Regards,
    TeamLinkup
  `;
  console.log(`Simulating Email to: ${recipientEmail}\nSubject: ${subject}\nBody: ${body}`);
  alert(`Mock Email Sent to ${recipientEmail}:\nSubject: ${subject}\n\nMatch reminder for tomorrow. Check console for details.`);
};

export const sendMatchCancellationEmail = (
  recipientEmail: string,
  cancelledMatchDetails: ConfirmedMatch
): void => {
  const subject = "Match Cancelled";
  const body = `
    Hi there,

    We regret to inform you that your match scheduled for:
    Sport: ${cancelledMatchDetails.sport}
    Date & Time: ${new Date(cancelledMatchDetails.matchDateTime).toLocaleString()}
    Venue: ${cancelledMatchDetails.venueName}

    has been cancelled by the other team.

    We apologize for any inconvenience.

    Regards,
    TeamLinkup
  `;
  console.log(`Simulating Email to: ${recipientEmail}\nSubject: ${subject}\nBody: ${body}`);
  alert(`Mock Email Sent to ${recipientEmail}:\nSubject: ${subject}\n\nMatch on ${new Date(cancelledMatchDetails.matchDateTime).toLocaleDateString()} has been cancelled. Check console for details.`);
};
