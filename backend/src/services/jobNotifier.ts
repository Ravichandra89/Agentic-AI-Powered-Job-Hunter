import nodemailer, { Transporter } from "nodemailer";
import { JobDetails } from "../types/job.types";
import { log } from "../config/logger";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const createTransporter = (): Transporter => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  };

  if (!config.auth.user || !config.auth.pass) {
    log.warn("SMTP -- credential missing -- emails will not be sent");
  }

  return nodemailer.createTransport(config);
};

/**
 * Email Helper Template
 */

const formatJobEmailHTML = (jobs: JobDetails[]): string => {
  const items = jobs
    .map(
      (job) => `
        <div style="margin-bottom:24px;padding:16px;border-left:4px solid #0073b1;background:#f9f9f9;">
          <h2 style="margin:0;color:#333;">${job.title}</h2>
          <p style="margin:4px 0;color:#555;"><strong>Company:</strong> ${
            job.companyName
          }</p>
  
          ${
            job.location
              ? `<p><strong>Location:</strong> ${job.location}</p>`
              : ""
          }
          ${job.salary ? `<p><strong>Salary:</strong> ${job.salary}</p>` : ""}
          ${
            job.employmentType
              ? `<p><strong>Type:</strong> ${job.employmentType}</p>`
              : ""
          }
          ${
            job.seniorityLevel
              ? `<p><strong>Seniority:</strong> ${job.seniorityLevel}</p>`
              : ""
          }
  
          ${
            job.skills?.length
              ? `<p><strong>Skills:</strong> ${job.skills.join(", ")}</p>`
              : ""
          }
  
          <div style="margin-top:12px;padding:12px;background:#fff;border-radius:4px;">
            <h3 style="margin:0;font-size:14px;">Job Description:</h3>
            <p style="color:#444;font-size:14px;line-height:1.5;">
              ${job.description?.slice(0, 500)}${
        job.description && job.description.length > 500 ? "..." : ""
      }
            </p>
          </div>
  
          <a href="${job.jobUrl}"
             style="display:inline-block;margin-top:12px;padding:10px 16px;background:#0073b1;color:#fff;text-decoration:none;border-radius:4px;">
            View Job
          </a>
        </div>
      `
    )
    .join("");

  return `
      <html>
      <body style="font-family:Arial;padding:20px;color:#333;">
        <div style="background:#0073b1;color:#fff;padding:20px;border-radius:4px 4px 0 0;">
          <h1 style="margin:0;">🚀 New Job Alerts</h1>
          <p>${jobs.length} new job${
    jobs.length > 1 ? "s" : ""
  } found for you!</p>
        </div>
  
        <div style="border:1px solid #ddd;border-top:none;border-radius:0 0 4px 4px;padding:20px;background:#fff;">
          ${items}
        </div>
  
        <p style="font-size:12px;color:#777;margin-top:20px;text-align:center;">
          Automated email from <strong>AI Job Hunter</strong>.
        </p>
      </body>
      </html>
    `;
};

/**
 * Formatted Email Text
 */
const formatJobEmailText = (jobs: JobDetails[]): string => {
  return jobs
    .map((job) => {
      return `
  ${job.title}
  Company: ${job.companyName}
  ${job.location ? `Location: ${job.location}` : ""}
  ${job.salary ? `Salary: ${job.salary}` : ""}
  ${job.employmentType ? `Employment: ${job.employmentType}` : ""}
  ${job.seniorityLevel ? `Seniority: ${job.seniorityLevel}` : ""}
  Skills: ${job.skills?.join(", ")}
  
  Description:
  ${job.description?.slice(0, 500)}${
        job.description && job.description.length > 500 ? "..." : ""
      }
  
  URL: ${job.jobUrl}
  -----------------------------------------------------------
  `;
    })
    .join("\n");
};

/**
 * Send bulk Job Alets
 */

export const sendJobAlert = async (jobs: JobDetails[]): Promise<boolean> => {
  if (!jobs.length) {
    log.warn("sendJobAlert() called with no jobs");
    return false;
  }

  const transporter = createTransporter();

  const to = process.env.ALERT_EMAIL_TO;
  if (!to) {
    log.error("ALERT_EMAIL_TO not configured");
    return false;
  }

  try {
    await transporter.verify().catch(() => {
      log.warn("SMTP verify failed — continuing anyway.");
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER || "noreply@aijobhunter.com",
      to,
      subject: `🚀 ${jobs.length} New Job Alert${
        jobs.length > 1 ? "s" : ""
      } — AI Job Hunter`,
      text: formatJobEmailText(jobs),
      html: formatJobEmailHTML(jobs),
    });

    log.info(`Alert email sent → ${to}, messageId=${info.messageId}`);
    return true;
  } catch (err) {
    log.error("Email send failed: " + String(err));
    return false;
  }
};

/**
 * Sending single job notification
 */
export const sendSingleJobAlert = async (job: JobDetails): Promise<boolean> => {
  return sendJobAlert([job]);
};
