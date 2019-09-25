#!/usr/bin/env python

# Script to submit assignments (homeworks and projects).

import os, sys, json, time, datetime, dateutil.parser, pwd, shutil, subprocess

############################################################

class Assignment(object):
    def __init__(self, info):
        self.id = info['id']
        self.title = info['title']
        self.dueDate = dateutil.parser.parse(info['dueDate'])
        self.files = info['files']
        self.maxLateDays = info['maxLateDays']  # Maximum number of late days per assignment
        self.maxFileSizeMB = info['maxFileSizeMB']  # Maximum size of file that can be submitted
        self.maxSubmissions = info['maxSubmissions']  # Maximum number of submissions per assignment

class Course(object):
    def __init__(self):
        path = os.path.join(os.path.dirname(sys.argv[0]), 'submit.json')
        with open(path) as f:
            info = json.load(f)
        self.courseName = info['courseName']
        self.submissionsPath = info['submissionsPath']
        self.assignments = [Assignment(item) for item in info['assignments']]

    def getAssignment(self, assignmentId):
        for assignment in self.assignments:
            if assignment.id == assignmentId:
                return assignment
        return None

    def printAssignments(self):
        print "-- Assignments --"
        maxIdWidth = max(len(assign.id) for assign in self.assignments)
        maxTitleWidth = max(len(assign.title) for assign in self.assignments)
        fmt = '  %-'+str(maxIdWidth)+'s %-'+str(maxTitleWidth)+'s %-10s'
        print fmt % ("[ID]", "[Title]", "[Due Date]")
        now = datetime.datetime.now()
        for assign in self.assignments:
            if now > assign.dueDate:
                status = '(due date passed)'
            else:
                diff = assign.dueDate - now
                status = '(%d days remaining)' % diff.days
            print fmt % (assign.id, assign.title, assign.dueDate.strftime('%Y-%m-%d %H:%M') + ' ' + status)

def ensure(success, message):
    if callable(success):
        try:
            success()
            success = True
        except:
            success = False
    if not success:
        print message
        sys.exit(1)

def ensureDirExists(path):
    if not os.path.exists(path):
        ensure(lambda : os.mkdir(path), "Error: unable to create directory '%s'" % path)
    if not os.path.isdir(path):
        ensure(os.path.exists(path), "Error: '%s' is not a directory" % path)
    return path

def createNewAttemptDir(basePath, maxSubmissions):
    for t in range(1, maxSubmissions + 1):
        path = os.path.join(basePath, str(t))
        if not os.path.exists(path):
            return ensureDirExists(path)
    print "Error: you have made too many submissions."
    sys.exit(1)

def fileMatches(path1, path2):
    return os.path.getsize(path1) == os.path.getsize(path1)

def isSunetIdValid(sunetId):
    try:
        user = pwd.getpwnam(sunetId)
    except KeyError as e:
        return False
    print 'Resolving SUNet ID {} => {}'.format(sunetId, user.pw_gecos.split(",")[0])
    return True

def queryInt(query, maxVal):
    while True:
        try:
            value = int(raw_input(query))
        except ValueError:
            print 'Please input a valid value. Try again...'
            continue
        except KeyboardInterrupt:
            print '\nCtrl-C detected. Try again...'
            continue
        except EOFError:
            print '\nCtrl-D detected. Try again...'
            continue
        else:
            if value < 1 or value > maxVal:
              continue
            else:
              return value

def queryStr(query):
    st = raw_input(query)
    if len(st) > 1024:
      return st[:1024]+',,,'
    return st


def queryYesOrNo(query):
    # Keep looping until we receive a valid response
    while True:
        st = raw_input(query)
        if st.lower() in ['y', 'yes']:
            return True
        if st.lower() in ['n', 'no']:
            return False
        query = 'Invalid answer; please enter yes or no: '


def pdfinfo_extract(pdf_path):
    # parse output of pdfinfo
    def parse_output(output):
        info = {}
        for line in output.splitlines():
            key, val = line.split(':', 1)
            info[key.strip()] = val.strip()
        return info

    # http://stackoverflow.com/a/12926181/1240620
    with open(os.devnull, 'wb') as DEVNULL:
        proc = subprocess.Popen(['pdfinfo', pdf_path], stdout=subprocess.PIPE, stderr=DEVNULL)

    output = proc.communicate()[0]
    exit_code = proc.returncode

    return parse_output(output) if exit_code == 0 else None

def submit(course, assignmentId, sourcePath):
    # Check the assignment
    assign = course.getAssignment(assignmentId)
    if assign is None:
        print "Error: invalid assignment ID '%s'" % assignmentId
        print
        course.printAssignments()
        sys.exit(1)

    # Check hard deadline
    now = datetime.datetime.now()
    hardDeadline = assign.dueDate + datetime.timedelta(days=assign.maxLateDays)
    if now > hardDeadline:
        print "\n[WARNING]: Hard deadline for %s (%s) has passed." % (assignmentId, hardDeadline.strftime('%Y-%m-%d %H:%M'))
        warningQuery = "Are you *sure* you want to submit %s (y/n): " % assignmentId
        answer = queryYesOrNo(warningQuery)
        if not answer:
            print 'Exiting.'
            sys.exit(0)

    # Check the submit path and the files
    ensure(os.path.exists(sourcePath), "Error: trying to submit directory '%s', but it doesn't exist" % sourcePath)
    ensure(os.path.isdir(sourcePath), "Error: '%s' exists but is not a directory" % sourcePath)
    messages = []
    for file in assign.files:
        path = os.path.join(sourcePath, file)
        if not os.path.exists(path):
            messages.append("Error: required file doesn't exist: '%s'" % path)
            continue
        sizeBytes = os.path.getsize(path)
        if sizeBytes > assign.maxFileSizeMB*1024*1024:
            messages.append('Error: size of %s (%s bytes) exceeds the %sMB limit' % (path, sizeBytes, assign.maxFileSizeMB))
        if file in ['group.txt', 'cas.txt']:
            for line in open(path):
                sunetId = line.strip()
                if not isSunetIdValid(sunetId):
                    messages.append('Error: SUNet ID "{}" is invalid'.format(sunetId))
    ensure(len(messages) == 0, '\n'.join(messages))

    # Create the submission directory
    sunetId = os.environ['USER']
    try:
        name = pwd.getpwnam(sunetId).pw_gecos.split(",")[0]
    except KeyError:
        print '[WARNING] Invalid SUNet ID: {}'.format(sunetId)
        name = '???'
    assignmentPath = ensureDirExists(os.path.join(course.submissionsPath, assignmentId))
    sunetIdPath = ensureDirExists(os.path.join(assignmentPath, sunetId))
    destPath = createNewAttemptDir(sunetIdPath, assign.maxSubmissions)
    attempt = int(os.path.basename(destPath))
    timestamp = time.time()
    print "Submission for assignment '%s' (attempt %s/%s) as '%s' at %s" % \
            (assignmentId, attempt, assign.maxSubmissions, sunetId, datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S'))

    # Survey students for time spent and difficulty
    if attempt == 1:  # Only survey on the first attempt
        print "Please answer a quick survey (this will only show up on your first submission attempt):"
        assignmentTimeSpent = queryInt('Hours spent on assignment [1 - 40]: ', 40)
        assignmentReward = queryInt('How rewarding was the assignment for you [1 (not at all) - 10 (extremely)]: ',10)
        assignmentComment = queryStr('Any additional comments: ')
    else:
        assignmentTimeSpent = None
        assignmentReward = None
        assignmentComment = None

    # Copy the files over
    pdfPages = 0
    pdfValid = True
    for file in assign.files:
        sourceFilePath = os.path.join(sourcePath, file)
        destFilePath = os.path.join(destPath, file)
        if os.path.isdir(sourceFilePath):
            ensure(lambda : shutil.copytree(sourceFilePath, destFilePath), "Error: could not copy directory '%s'" % sourceFilePath)
            print "  %s [directory]" % sourceFilePath
        else:
            ensure(lambda : shutil.copy(sourceFilePath, destPath), "Error: could not copy file '%s'" % sourceFilePath)
            ensure(fileMatches(sourceFilePath, destFilePath), "Error: copying '%s' was incomplete" % sourceFilePath)
            if file.endswith('.pdf'):
                info = pdfinfo_extract(sourceFilePath)
                if info:
                    pdfPages = int(info['Pages'])
                    print '  [INFO]: %s has %d page%s.' % (file, pdfPages, '' if pdfPages == 1 else 's')
                else:
                    pdfValid = False
                    print '  [WARNING]: It seems %s is not a valid PDF file. Please double check!' % file
                    print '             If you are confident it is, please ignore this warning.'

            print "  %s [%d bytes]" % (sourceFilePath, os.path.getsize(destFilePath))

    # Write metadata
    metadata = {}
    metadata['timestamp'] = timestamp
    metadata['assignmentId'] = assignmentId
    metadata['sunetId'] = sunetId
    metadata['attempt'] = attempt
    metadata['name'] = name

    metadata['pdfPages'] = pdfPages
    metadata['pdfValid'] = pdfValid

    metadata['surveyTime'] = assignmentTimeSpent
    metadata['surveyReward'] = assignmentReward
    metadata['surveyComment'] = assignmentComment

    with open(os.path.join(destPath, 'metadata.json'), 'w') as out:
        print >>out, json.dumps(metadata)

    print
    print 'Thank you for submitting [%s].' % assignmentId
    if not assignmentId.startswith('p-'):
        print 'The results of your submission will be sanity checked and posted to:'
        print
        print '    http://cs221.stanford.edu/restricted/grades.html'
        print
        print 'This should take no more than 10 minutes.'

############################################################
# Main

course = Course()

if len(sys.argv) != 3:
    print "Usage:\n  %s <assignment ID> <directory containing submission files (e.g., '.')>" % sys.argv[0]
    print
    course.printAssignments()
    sys.exit(1)

assignmentId = sys.argv[1]
sourcePath = sys.argv[2]
submit(course, assignmentId, sourcePath)
